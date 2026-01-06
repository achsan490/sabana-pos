
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkColumns() {
    console.log('--- Checking Columns ---');

    // Try to select the specific columns
    const { data, error } = await supabase
        .from('orders')
        .select('id, customer_name, customer_phone, customer_address')
        .limit(1);

    if (error) {
        console.log('ERROR Selecting new columns:');
        console.log(error.message);
        console.log('This confirms the columns DO NOT exist or are not accessible.');
    } else {
        console.log('SUCCESS! Columns found.');
        if (data.length > 0) {
            console.log('Row data keys:', Object.keys(data[0]));
        }
    }

    // Also print all keys from * select
    const { data: allData } = await supabase.from('orders').select('*').limit(1);
    if (allData && allData.length > 0) {
        console.log('\nAll available columns:');
        console.log(JSON.stringify(Object.keys(allData[0]), null, 2));
    }
}

checkColumns();
