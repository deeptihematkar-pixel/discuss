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
        """Test creating a discussion post with hashtags (NO title field)"""
        post_data = {
            "type": "discussion",
            "content": "This is a test discussion post created by the testing script. Let's talk about #react and #nodejs development. #javascript #webdev",
            "hashtags": ["testing", "automation"]
        }
        success, response = self.run_test(
            "Create Discussion Post with Hashtags (NO title)",
            "POST",
            "posts",
            200,
            data=post_data
        )
        if success and 'id' in response:
            self.created_post_id = response['id']
            print(f"   Created post ID: {self.created_post_id}")
            # Check if hashtags were extracted and included
            hashtags = response.get('hashtags', [])
            print(f"   Post hashtags: {hashtags}")
            return True
        return False

    def test_create_project_post(self):
        """Test creating a project post with hashtags"""
        post_data = {
            "type": "project",
            "title": "Test Project Post #python #api",
            "content": "This is a test project post with links and #fastapi hashtags.",
            "github_link": "https://github.com/test/repo",
            "preview_link": "https://test-app.com",
            "hashtags": ["backend", "database"]
        }
        success, response = self.run_test(
            "Create Project Post with Hashtags",
            "POST",
            "posts",
            200,
            data=post_data
        )
        if success and 'id' in response:
            project_post_id = response['id']
            print(f"   Created project post ID: {project_post_id}")
            hashtags = response.get('hashtags', [])
            print(f"   Project hashtags: {hashtags}")
            return True
        return False

    def test_get_posts_with_data(self):
        """Test getting posts after creating some"""
        success, response = self.run_test("Get Posts (with data)", "GET", "posts", 200)
        if success:
            print(f"   Found {len(response)} posts")
            return len(response) > 0
        return False

    def test_upvote_post(self):
        """Test upvoting a post"""
        if not self.created_post_id:
            print("❌ No post ID available for upvote test")
            return False
        
        success, response = self.run_test(
            "Upvote Post",
            "POST",
            f"posts/{self.created_post_id}/vote",
            200,
            data={"vote_type": "up"}
        )
        if success:
            print(f"   Upvote count: {response.get('upvote_count')}, Downvote count: {response.get('downvote_count')}")
        return success

    def test_downvote_post(self):
        """Test downvoting a post"""
        if not self.created_post_id:
            print("❌ No post ID available for downvote test")
            return False
        
        success, response = self.run_test(
            "Downvote Post",
            "POST",
            f"posts/{self.created_post_id}/vote",
            200,
            data={"vote_type": "down"}
        )
        if success:
            print(f"   Upvote count: {response.get('upvote_count')}, Downvote count: {response.get('downvote_count')}")
        return success

    def test_toggle_vote_off(self):
        """Test toggling vote off (clicking same vote again)"""
        if not self.created_post_id:
            print("❌ No post ID available for vote toggle test")
            return False
        
        success, response = self.run_test(
            "Toggle Vote Off",
            "POST",
            f"posts/{self.created_post_id}/vote",
            200,
            data={"vote_type": "down"}
        )
        if success:
            print(f"   Upvote count: {response.get('upvote_count')}, Downvote count: {response.get('downvote_count')}")
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

    def test_check_username_availability(self):
        """Test username availability check"""
        # Test available username
        success, response = self.run_test(
            "Check Username Available",
            "GET",
            "auth/check-username/newuser123",
            200
        )
        if success:
            print(f"   Available: {response.get('available')}")
        
        # Test taken username
        success2, response2 = self.run_test(
            "Check Username Taken",
            "GET",
            "auth/check-username/testuser",
            200
        )
        if success2:
            print(f"   Available: {response2.get('available')}")
        
        return success and success2

    def test_check_email_availability(self):
        """Test email availability check"""
        # Test available email
        success, response = self.run_test(
            "Check Email Available",
            "GET",
            "auth/check-email/newemail@test.com",
            200
        )
        if success:
            print(f"   Available: {response.get('available')}")
        
        # Test taken email
        success2, response2 = self.run_test(
            "Check Email Taken",
            "GET",
            "auth/check-email/testuser@discuss.com",
            200
        )
        if success2:
            print(f"   Available: {response2.get('available')}")
        
        return success and success2

    def test_search_posts(self):
        """Test post search functionality"""
        # Search by title
        success1, response1 = self.run_test(
            "Search Posts by Title",
            "GET",
            "posts?search=Test Discussion",
            200
        )
        if success1:
            print(f"   Found {len(response1)} posts by title")
        
        # Search by hashtag
        success2, response2 = self.run_test(
            "Search Posts by Hashtag",
            "GET",
            "posts?search=javascript",
            200
        )
        if success2:
            print(f"   Found {len(response2)} posts by hashtag")
        
        # Search by content
        success3, response3 = self.run_test(
            "Search Posts by Content",
            "GET",
            "posts?search=fastapi",
            200
        )
        if success3:
            print(f"   Found {len(response3)} posts by content")
        
        return success1 and success2 and success3

    def test_trending_hashtags(self):
        """Test trending hashtags endpoint"""
        success, response = self.run_test(
            "Get Trending Hashtags",
            "GET",
            "hashtags/trending",
            200
        )
        if success:
            print(f"   Found {len(response)} trending hashtags")
            if response:
                print(f"   Top hashtag: {response[0].get('tag')} ({response[0].get('count')} posts)")
        return success

    def test_auth_error_messages(self):
        """Test detailed auth error messages"""
        # Test wrong password
        success1, response1 = self.run_test(
            "Login Wrong Password",
            "POST",
            "auth/login",
            401,
            data={"email": "testuser@discuss.com", "password": "wrongpassword"}
        )
        
        # Test non-existent email
        success2, response2 = self.run_test(
            "Login Non-existent Email",
            "POST",
            "auth/login",
            404,
            data={"email": "nonexistent@test.com", "password": "password"}
        )
        
        # Test duplicate username registration
        success3, response3 = self.run_test(
            "Register Duplicate Username",
            "POST",
            "auth/register",
            400,
            data={"username": "testuser", "email": "new@test.com", "password": "password"}
        )
        
        # Test duplicate email registration
        success4, response4 = self.run_test(
            "Register Duplicate Email",
            "POST",
            "auth/register",
            400,
            data={"username": "newuser", "email": "testuser@discuss.com", "password": "password"}
        )
        
        return success1 and success2 and success3 and success4

def main():
    print("🚀 Starting Discuss API Testing...")
    print("=" * 50)
    
    tester = DiscussAPITester()
    
    # Test sequence
    tests = [
        ("API Health Check", tester.test_health_check),
        ("Check Username Availability", tester.test_check_username_availability),
        ("Check Email Availability", tester.test_check_email_availability),
        ("Register New User", tester.test_register_new_user),
        ("Get Current User Info", tester.test_get_current_user),
        ("Get Posts (Empty)", tester.test_get_posts_empty),
        ("Create Discussion Post with Hashtags", tester.test_create_discussion_post),
        ("Create Project Post with Hashtags", tester.test_create_project_post),
        ("Get Posts (With Data)", tester.test_get_posts_with_data),
        ("Search Posts", tester.test_search_posts),
        ("Get Trending Hashtags", tester.test_trending_hashtags),
        ("Upvote Post", tester.test_upvote_post),
        ("Downvote Post", tester.test_downvote_post),
        ("Toggle Vote Off", tester.test_toggle_vote_off),
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
        ("Test Auth Error Messages", tester.test_auth_error_messages),
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