const { BskyAgent } = require('@atproto/api');
require('dotenv').config();

const BSKYHANDLE = process.env.BSKYHANDLE;
const BSKYPASS = process.env.BSKYPASS;

const Unfollowing = async () => {
    const agent = new BskyAgent({
        service: 'https://bsky.social'
    });

    // Login with provided credentials
    try {
        await agent.login({
            identifier: BSKYHANDLE,
            password: BSKYPASS
        });
        console.log('Login successful!');
    } catch (error) {
        console.error('Failed to log in:', error.message);
        return;
    }

    let follows = [];
    let cursor;

    // Fetch all follows, including those that might be orphaned
    while (true) {
        try {
            const following = await agent.app.bsky.graph.getFollows({
                cursor,
                actor: BSKYHANDLE,
            });

            cursor = following.data.cursor;
            follows = [...follows, ...following.data.follows];

            console.log(`Fetched ${following.data.follows.length} follows in this batch. Cursor: ${cursor}`);
            if (!cursor) break;
        } catch (error) {
            console.error('Failed to fetch follows:', error.message);
            return;
        }
    }

    console.log(`Total follows retrieved: ${follows.length}`);
    console.log('Attempting to unfollow all accounts...');

    // Process each follow and attempt to unfollow
    for (const actor of follows) {
        const followingInfo = actor?.viewer?.following;
        if (!followingInfo) {
            console.warn(`Skipping ${actor?.handle || "unknown account"} - no valid following info.`);
            continue;
        }

        const parts = followingInfo.split('/').reverse();

        if (parts.length < 3) {
            console.warn(`Skipping ${actor.handle} - malformed following info: ${followingInfo}`);
            continue;
        }

        const [rkey, , repo] = parts;
        console.log(`Unfollowing ${actor.handle} - rkey: ${rkey}, repo: ${repo}`);

        try {
            const response = await agent.com.atproto.repo.deleteRecord({
                collection: 'app.bsky.graph.follow',
                repo,
                rkey,
            });
            console.log(`Successfully unfollowed ${actor.handle}`, response);
        } catch (error) {
            console.error(`Failed to unfollow ${actor.handle}`, error.message);
        }
    }

    // Clean up orphaned records by attempting direct deletions
    console.log('Attempting to clean up orphaned follow records...');
    for (let i = 1; i <= 2000; i++) {
        const rkey = i.toString();
        try {
            const response = await agent.com.atproto.repo.deleteRecord({
                collection: 'app.bsky.graph.follow',
                repo: BSKYHANDLE,
                rkey,
            });
            console.log(`Deleted record with rkey: ${rkey}`, response);
        } catch (error) {
            if (error.message.includes('Record not found')) {
                console.log(`No record found for rkey: ${rkey}`);
            } else {
                console.error(`Error deleting record with rkey: ${rkey}`, error.message);
            }
        }
    }

    console.log('Unfollow process completed.');
};

Unfollowing();