import requests
import sys

class VoteSystemTester:
    def __init__(self, base_url="https://talk-share-4.preview.emergentagent.com"):
        self.base_url = base_url
        self.token = None
        self.user_id = None
        self.post_id = None

    def register_and_login(self):
        """Register fresh test user"""
        import time
        timestamp = str(int(time.time()))
        
        # Register fresh user
        register_data = {
            "username": f"testuser{timestamp}",
            "email": f"testuser{timestamp}@discuss.com", 
            "password": "test123456"
        }
        
        url = f"{self.base_url}/api/auth/register"
        response = requests.post(url, json=register_data)
        
        if response.status_code == 200:
            data = response.json()
            self.token = data['token']
            self.user_id = data['id']
            print(f"✅ Registered user: {data['username']}")
            return True
        else:
            print(f"❌ Registration failed: {response.status_code} - {response.text}")
            return False

    def create_test_post(self):
        """Create a test post for voting"""
        post_data = {
            "type": "discussion",
            "content": "Test post for vote system #testing"
        }
        
        url = f"{self.base_url}/api/posts"
        headers = {'Authorization': f'Bearer {self.token}', 'Content-Type': 'application/json'}
        response = requests.post(url, json=post_data, headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            self.post_id = data['id']
            print(f"✅ Created post: {self.post_id}")
            print(f"   Initial upvotes: {data.get('upvote_count', 0)}")
            print(f"   Initial downvotes: {data.get('downvote_count', 0)}")
            return True
        else:
            print(f"❌ Post creation failed: {response.status_code} - {response.text}")
            return False

    def test_upvote(self):
        """Test upvoting"""
        url = f"{self.base_url}/api/posts/{self.post_id}/vote"
        headers = {'Authorization': f'Bearer {self.token}', 'Content-Type': 'application/json'}
        data = {"vote_type": "up"}
        
        response = requests.post(url, json=data, headers=headers)
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Upvote successful")
            print(f"   Upvotes: {result.get('upvote_count', 0)}")
            print(f"   Downvotes: {result.get('downvote_count', 0)}")
            return result
        else:
            print(f"❌ Upvote failed: {response.status_code} - {response.text}")
            return None

    def test_downvote(self):
        """Test downvoting (should switch from upvote)"""
        url = f"{self.base_url}/api/posts/{self.post_id}/vote"
        headers = {'Authorization': f'Bearer {self.token}', 'Content-Type': 'application/json'}
        data = {"vote_type": "down"}
        
        response = requests.post(url, json=data, headers=headers)
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Downvote successful")
            print(f"   Upvotes: {result.get('upvote_count', 0)}")
            print(f"   Downvotes: {result.get('downvote_count', 0)}")
            return result
        else:
            print(f"❌ Downvote failed: {response.status_code} - {response.text}")
            return None

    def test_toggle_off(self):
        """Test toggling vote off"""
        url = f"{self.base_url}/api/posts/{self.post_id}/vote"
        headers = {'Authorization': f'Bearer {self.token}', 'Content-Type': 'application/json'}
        data = {"vote_type": "down"}  # Same as current vote to toggle off
        
        response = requests.post(url, json=data, headers=headers)
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Vote toggle off successful")
            print(f"   Upvotes: {result.get('upvote_count', 0)}")
            print(f"   Downvotes: {result.get('downvote_count', 0)}")
            return result
        else:
            print(f"❌ Vote toggle failed: {response.status_code} - {response.text}")
            return None

def main():
    print("🗳️  Testing Vote System...")
    print("=" * 40)
    
    tester = VoteSystemTester()
    
    # Register and login
    if not tester.register_and_login():
        return 1
    
    # Create test post
    if not tester.create_test_post():
        return 1
    
    # Test vote sequence
    print("\n📊 Testing vote sequence...")
    
    # 1. Upvote
    result1 = tester.test_upvote()
    if not result1:
        return 1
    
    # 2. Switch to downvote
    result2 = tester.test_downvote()
    if not result2:
        return 1
    
    # 3. Toggle off
    result3 = tester.test_toggle_off()
    if not result3:
        return 1
    
    print("\n🎉 Vote system tests completed successfully!")
    return 0

if __name__ == "__main__":
    sys.exit(main())