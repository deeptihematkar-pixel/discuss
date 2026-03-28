import requests
import sys
import json
from datetime import datetime

class DiscussAPITester:
    def __init__(self, base_url="https://talk-share-4.preview.emergentagent.com"):
        self.base_url = base_url
        self.token = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.created_post_id = None
        self.created_comment_id = None

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/api/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        if headers:
            test_headers.update(headers)

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    if isinstance(response_data, dict) and len(str(response_data)) < 500:
                        print(f"   Response: {response_data}")
                    return True, response_data
                except:
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   Error: {error_data}")
                except:
                    print(f"   Error: {response.text}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_health_check(self):
        """Test API health check"""
        return self.run_test("API Health Check", "GET", "", 200)

    def test_register_new_user(self):
        """Test user registration"""
        timestamp = datetime.now().strftime('%H%M%S')
        test_data = {
            "username": f"testuser2",
            "email": "testuser2@discuss.com",
            "password": "test123456"
        }
        success, response = self.run_test(
            "Register New User",
            "POST",
            "auth/register",
            200,
            data=test_data
        )
        if success and 'token' in response:
            self.token = response['token']
            self.user_id = response.get('id')
            print(f"   Registered user ID: {self.user_id}")
            return True
        return False

    def test_login_existing_user(self):
        """Test login with existing user"""
        success, response = self.run_test(
            "Login Existing User",
            "POST",
            "auth/login",
            200,
            data={"email": "testuser@discuss.com", "password": "test123456"}
        )
        if success and 'token' in response:
            self.token = response['token']
            self.user_id = response.get('id')
            print(f"   Logged in user ID: {self.user_id}")
            return True
        return False

    def test_get_current_user(self):
        """Test getting current user info"""
        return self.run_test("Get Current User", "GET", "auth/me", 200)[0]

    def test_get_posts_empty(self):
        """Test getting posts (should be empty initially)"""
        success, response = self.run_test("Get Posts", "GET", "posts", 200)
        if success:
            print(f"   Found {len(response)} posts")
        return success

    def test_create_discussion_post(self):
        """Test creating a discussion post"""
        post_data = {
            "type": "discussion",
            "title": "Test Discussion Post",
            "content": "This is a test discussion post created by the testing script."
        }
        success, response = self.run_test(
            "Create Discussion Post",
            "POST",
            "posts",
            200,
            data=post_data
        )
        if success and 'id' in response:
            self.created_post_id = response['id']
            print(f"   Created post ID: {self.created_post_id}")
            return True
        return False

    def test_create_project_post(self):
        """Test creating a project post"""
        post_data = {
            "type": "project",
            "title": "Test Project Post",
            "content": "This is a test project post with links.",
            "github_link": "https://github.com/test/repo",
            "preview_link": "https://test-app.com"
        }
        success, response = self.run_test(
            "Create Project Post",
            "POST",
            "posts",
            200,
            data=post_data
        )
        if success and 'id' in response:
            project_post_id = response['id']
            print(f"   Created project post ID: {project_post_id}")
            return True
        return False

    def test_get_posts_with_data(self):
        """Test getting posts after creating some"""
        success, response = self.run_test("Get Posts (with data)", "GET", "posts", 200)
        if success:
            print(f"   Found {len(response)} posts")
            return len(response) > 0
        return False

    def test_like_post(self):
        """Test liking a post"""
        if not self.created_post_id:
            print("❌ No post ID available for like test")
            return False
        
        success, response = self.run_test(
            "Like Post",
            "POST",
            f"posts/{self.created_post_id}/like",
            200
        )
        if success:
            print(f"   Like status: {response.get('liked')}, Count: {response.get('like_count')}")
        return success

    def test_unlike_post(self):
        """Test unliking a post"""
        if not self.created_post_id:
            print("❌ No post ID available for unlike test")
            return False
        
        success, response = self.run_test(
            "Unlike Post",
            "POST",
            f"posts/{self.created_post_id}/like",
            200
        )
        if success:
            print(f"   Like status: {response.get('liked')}, Count: {response.get('like_count')}")
        return success

    def test_get_comments_empty(self):
        """Test getting comments for a post (should be empty)"""
        if not self.created_post_id:
            print("❌ No post ID available for comments test")
            return False
        
        success, response = self.run_test(
            "Get Comments (empty)",
            "GET",
            f"posts/{self.created_post_id}/comments",
            200
        )
        if success:
            print(f"   Found {len(response)} comments")
        return success

    def test_create_comment(self):
        """Test creating a comment"""
        if not self.created_post_id:
            print("❌ No post ID available for comment creation")
            return False
        
        comment_data = {"text": "This is a test comment on the post."}
        success, response = self.run_test(
            "Create Comment",
            "POST",
            f"posts/{self.created_post_id}/comments",
            200,
            data=comment_data
        )
        if success and 'id' in response:
            self.created_comment_id = response['id']
            print(f"   Created comment ID: {self.created_comment_id}")
            return True
        return False

    def test_get_comments_with_data(self):
        """Test getting comments after creating one"""
        if not self.created_post_id:
            print("❌ No post ID available for comments test")
            return False
        
        success, response = self.run_test(
            "Get Comments (with data)",
            "GET",
            f"posts/{self.created_post_id}/comments",
            200
        )
        if success:
            print(f"   Found {len(response)} comments")
            return len(response) > 0
        return False

    def test_update_post(self):
        """Test updating a post"""
        if not self.created_post_id:
            print("❌ No post ID available for update test")
            return False
        
        update_data = {
            "title": "Updated Test Discussion Post",
            "content": "This post has been updated by the testing script."
        }
        success, response = self.run_test(
            "Update Post",
            "PUT",
            f"posts/{self.created_post_id}",
            200,
            data=update_data
        )
        return success

    def test_get_user_stats(self):
        """Test getting user statistics"""
        if not self.user_id:
            print("❌ No user ID available for stats test")
            return False
        
        success, response = self.run_test(
            "Get User Stats",
            "GET",
            f"users/{self.user_id}/stats",
            200
        )
        if success:
            print(f"   User post count: {response.get('post_count')}")
        return success

    def test_delete_comment(self):
        """Test deleting a comment"""
        if not self.created_post_id or not self.created_comment_id:
            print("❌ No post/comment ID available for delete test")
            return False
        
        success, response = self.run_test(
            "Delete Comment",
            "DELETE",
            f"posts/{self.created_post_id}/comments/{self.created_comment_id}",
            200
        )
        return success

    def test_delete_post(self):
        """Test deleting a post"""
        if not self.created_post_id:
            print("❌ No post ID available for delete test")
            return False
        
        success, response = self.run_test(
            "Delete Post",
            "DELETE",
            f"posts/{self.created_post_id}",
            200
        )
        return success

    def test_logout(self):
        """Test logout"""
        success, response = self.run_test("Logout", "POST", "auth/logout", 200)
        if success:
            self.token = None
            self.user_id = None
        return success

def main():
    print("🚀 Starting Discuss API Testing...")
    print("=" * 50)
    
    tester = DiscussAPITester()
    
    # Test sequence
    tests = [
        ("API Health Check", tester.test_health_check),
        ("Register New User", tester.test_register_new_user),
        ("Get Current User Info", tester.test_get_current_user),
        ("Get Posts (Empty)", tester.test_get_posts_empty),
        ("Create Discussion Post", tester.test_create_discussion_post),
        ("Create Project Post", tester.test_create_project_post),
        ("Get Posts (With Data)", tester.test_get_posts_with_data),
        ("Like Post", tester.test_like_post),
        ("Unlike Post", tester.test_unlike_post),
        ("Get Comments (Empty)", tester.test_get_comments_empty),
        ("Create Comment", tester.test_create_comment),
        ("Get Comments (With Data)", tester.test_get_comments_with_data),
        ("Update Post", tester.test_update_post),
        ("Get User Stats", tester.test_get_user_stats),
        ("Delete Comment", tester.test_delete_comment),
        ("Delete Post", tester.test_delete_post),
        ("Logout", tester.test_logout),
        # Test with existing user
        ("Login Existing User", tester.test_login_existing_user),
        ("Get Current User Info (Existing)", tester.test_get_current_user),
        ("Get User Stats (Existing)", tester.test_get_user_stats),
    ]
    
    print(f"\n📋 Running {len(tests)} tests...")
    
    for test_name, test_func in tests:
        try:
            test_func()
        except Exception as e:
            print(f"❌ {test_name} - Exception: {str(e)}")
    
    # Print results
    print("\n" + "=" * 50)
    print(f"📊 Test Results: {tester.tests_passed}/{tester.tests_run} passed")
    success_rate = (tester.tests_passed / tester.tests_run * 100) if tester.tests_run > 0 else 0
    print(f"📈 Success Rate: {success_rate:.1f}%")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All tests passed!")
        return 0
    else:
        print(f"⚠️  {tester.tests_run - tester.tests_passed} tests failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())