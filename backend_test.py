#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime

class ELBERestaurantAPITester:
    def __init__(self, base_url="https://dine-digital-33.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = {}

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        default_headers = {'Content-Type': 'application/json'}
        if headers:
            default_headers.update(headers)

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=default_headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=default_headers, timeout=30)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=default_headers, timeout=30)

            success = response.status_code == expected_status
            
            result = {
                'status': 'PASSED' if success else 'FAILED',
                'expected_status': expected_status,
                'actual_status': response.status_code,
                'response_time': response.elapsed.total_seconds(),
                'endpoint': endpoint,
                'method': method
            }

            if success:
                self.tests_passed += 1
                print(f"✅ PASSED - Status: {response.status_code}")
                try:
                    result['response_data'] = response.json()
                except:
                    result['response_data'] = response.text
            else:
                print(f"❌ FAILED - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:200]}")
                result['error_response'] = response.text

            self.test_results[name] = result
            return success, response.json() if success and response.text else {}

        except requests.exceptions.Timeout:
            print(f"❌ FAILED - Request timeout (30s)")
            self.test_results[name] = {'status': 'FAILED', 'error': 'Timeout'}
            return False, {}
        except Exception as e:
            print(f"❌ FAILED - Error: {str(e)}")
            self.test_results[name] = {'status': 'FAILED', 'error': str(e)}
            return False, {}

    def test_get_menu(self):
        """Test GET /api/menu endpoint"""
        success, response = self.run_test(
            "Get Menu",
            "GET", 
            "menu",
            200
        )
        
        if success:
            # Validate response structure
            if 'items' in response and 'categories' in response:
                print(f"   ✓ Found {len(response['items'])} menu items")
                print(f"   ✓ Found {len(response['categories'])} categories")
                
                # Check if burger and pizza categories exist
                categories = {cat['id'] for cat in response['categories']}
                if 'burger' in categories:
                    print("   ✓ Burger category found")
                if 'pizza' in categories:
                    print("   ✓ Pizza category found")
                    
                return response
            else:
                print("   ❌ Invalid response structure")
                
        return {}

    def test_create_order(self):
        """Test POST /api/orders endpoint"""
        order_data = {
            "customer_name": "Test Customer",
            "phone": "+40123456789", 
            "email": "test@example.com",
            "notes": "Test order via API",
            "payment_method": "cash",
            "items": [
                {"item_id": "burger-1", "quantity": 2},
                {"item_id": "pizza-1", "quantity": 1}
            ],
            "language": "en"
        }
        
        success, response = self.run_test(
            "Create Order",
            "POST",
            "orders", 
            200,
            data=order_data
        )
        
        if success:
            if 'id' in response and 'total' in response:
                print(f"   ✓ Order created with ID: {response['id']}")
                print(f"   ✓ Total amount: {response['total']} RON")
                return response
            else:
                print("   ❌ Invalid order response structure")
        
        return {}

    def test_get_order(self, order_id):
        """Test GET /api/orders/{id} endpoint"""
        if not order_id:
            print("❌ Skipping get order test - no order ID")
            return {}
            
        success, response = self.run_test(
            f"Get Order {order_id}",
            "GET",
            f"orders/{order_id}",
            200
        )
        
        if success:
            if 'id' in response and response['id'] == order_id:
                print(f"   ✓ Retrieved order: {response['id']}")
                print(f"   ✓ Status: {response.get('status', 'N/A')}")
                print(f"   ✓ Items count: {len(response.get('items', []))}")
                return response
            else:
                print("   ❌ Order ID mismatch or invalid structure")
        
        return {}

    def test_checkout_session_creation(self, order_id):
        """Test POST /api/checkout/session endpoint"""
        if not order_id:
            print("❌ Skipping checkout session test - no order ID")
            return {}
            
        checkout_data = {
            "order_id": order_id,
            "origin_url": "https://dine-digital-33.preview.emergentagent.com"
        }
        
        success, response = self.run_test(
            "Create Checkout Session",
            "POST",
            "checkout/session",
            200,
            data=checkout_data
        )
        
        if success:
            if 'url' in response and 'session_id' in response:
                print(f"   ✓ Stripe session created")
                print(f"   ✓ Session ID: {response['session_id']}")
                return response
            else:
                print("   ❌ Invalid checkout session response")
        
        return {}

    def print_summary(self):
        """Print test summary"""
        print(f"\n" + "="*60)
        print(f"📊 TEST SUMMARY")
        print(f"="*60)
        print(f"Tests Run: {self.tests_run}")
        print(f"Tests Passed: {self.tests_passed}")
        print(f"Tests Failed: {self.tests_run - self.tests_passed}")
        print(f"Success Rate: {(self.tests_passed/self.tests_run*100) if self.tests_run > 0 else 0:.1f}%")
        
        # Print failed tests
        failed_tests = [name for name, result in self.test_results.items() if result.get('status') == 'FAILED']
        if failed_tests:
            print(f"\n❌ Failed Tests:")
            for test_name in failed_tests:
                result = self.test_results[test_name]
                print(f"   - {test_name}: {result.get('error', 'Status code mismatch')}")

def main():
    print("🏢 Starting EL&BE Restaurant API Tests")
    print("=" * 50)
    
    tester = ELBERestaurantAPITester()
    
    # Test 1: Get Menu
    menu_data = tester.test_get_menu()
    
    # Test 2: Create Order
    order_data = tester.test_create_order()
    order_id = order_data.get('id')
    
    # Test 3: Get Order by ID
    if order_id:
        tester.test_get_order(order_id)
        
        # Test 4: Create Stripe Checkout Session
        tester.test_checkout_session_creation(order_id)
    
    # Print results
    tester.print_summary()
    
    # Save results to file
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    with open(f'/app/backend_test_results_{timestamp}.json', 'w') as f:
        json.dump({
            'timestamp': timestamp,
            'total_tests': tester.tests_run,
            'passed_tests': tester.tests_passed,
            'success_rate': (tester.tests_passed/tester.tests_run*100) if tester.tests_run > 0 else 0,
            'detailed_results': tester.test_results
        }, f, indent=2)
    
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())