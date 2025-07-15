require('dotenv').config();
const { BskyAgent } = require('@atproto/api');

const BSKYHANDLE = process.env.BSKYHANDLE;
const BSKYPASS = process.env.BSKYPASS;

const WipeFollowRecords = async () => {
    const agent = new BskyAgent({ service: 'https://bsky.social' });

    try {
        await agent.login({ identifier: BSKYHANDLE, password: BSKYPASS });
        console.log('✅ Login successful!');
    } catch (error) {
        console.error('❌ Failed to log in:', error.message);
        return;
    }

    console.log('🔍 Retrieving all follow records directly from the repo...');

    let cursor;
    let records = [];

    while (true) {
        try {
            const response = await agent.com.atproto.repo.listRecords({
                collection: 'app.bsky.graph.follow',
                repo: BSKYHANDLE,
                cursor,
            });

            if (!response.data.records || response.data.records.length === 0) break;

            records = [...records, ...response.data.records];
            cursor = response.data.cursor;

            console.log(`📌 Fetched ${response.data.records.length} follow records.`);
            if (!cursor) break;
        } catch (error) {
            console.error('❌ Error fetching follow records:', error.message);
            break;
        }
    }

    console.log(`🔎 Total follow records found: ${records.length}`);

    for (const record of records) {
        if (!record?.uri) {
            console.error(`❌ Skipping record - missing "uri"`);
            continue;
        }

        const uriParts = record.uri.split('/');
        const rkey = uriParts[uriParts.length - 1];

        if (!rkey) {
            console.error(`❌ Skipping record - could not extract "rkey" from URI: ${record.uri}`);
            continue;
        }

        try {
            await agent.com.atproto.repo.deleteRecord({
                collection: 'app.bsky.graph.follow',
                repo: BSKYHANDLE,
                rkey: rkey,
            });
            console.log(`✅ Successfully deleted follow record: ${rkey}`);
        } catch (error) {
            console.error(`❌ Failed to delete record ${rkey}:`, error.message);
        }

        await new Promise(resolve => setTimeout(resolve, 250));
    }

    console.log('🎉 All follow records wiped!');
};

WipeFollowRecords();