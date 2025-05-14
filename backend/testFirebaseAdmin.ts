import { createUser, getUserByEmail, deleteUser, firebaseAdmin } from './src/firebaseAdmin';

async function runTests() {
    const testUsers: string[] = [];

    async function cleanup() {
        console.log('\nCleaning up...');
        for (const uid of testUsers) {
            try {
                await deleteUser(uid);
                console.log(`Deleted user: ${uid}`);
            } catch (error) {
                console.error(`Failed to delete user ${uid}:`, error);
            }
        }
    }

    try {
        // Test 1: Create User
        console.log('\nTest 1: Creating user...');
        const createdUser = await createUser({
            email: 'test2@example.com',
            password: 'TestPassword123!',
            displayName: 'Test User'
        });
        testUsers.push(createdUser.uid);
        console.log('User created successfully:', createdUser);

        // Test 2: Get User by Email
        console.log('\nTest 2: Fetching user by email...');
        const fetchedUser = await getUserByEmail('test@example.com');
        console.log('User fetched successfully:', fetchedUser);

        // Test 3: Update User
        console.log('\nTest 3: Updating user...');
        const updatedUser = await firebaseAdmin.updateUser(createdUser.uid, {
            displayName: 'Updated Test User'
        });
        console.log('User updated successfully:', updatedUser);

        console.log('\nAll tests passed successfully!');

    } catch (error) {
        console.error('Test failed:', error);
    } finally {
        await cleanup();
    }
}

// Run all tests
runTests().catch(console.error);