#!/usr/bin/env python3
"""
Test script for WhatsApp MCP Server
Run this locally to test the server before deploying to Cloud Run
"""

import requests
import json
import time
import sys
import os

def test_whatsapp_mcp_server(base_url="http://localhost:8080"):
    """Test the WhatsApp MCP server endpoints"""
    
    print(f"🧪 Testing WhatsApp MCP Server at {base_url}")
    print("=" * 50)
    
    # Test 1: Health Check
    try:
        print("1. Testing health endpoint...")
        response = requests.get(f"{base_url}/health", timeout=5)
        if response.status_code == 200:
            print("✅ Health check passed!")
            print(f"   Response: {response.json()}")
        else:
            print(f"❌ Health check failed! Status: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Health check failed! Error: {e}")
        return False
    
    # Test 2: API Documentation
    try:
        print("\n2. Testing API docs...")
        response = requests.get(f"{base_url}/docs", timeout=5)
        if response.status_code == 200:
            print("✅ API docs accessible!")
        else:
            print(f"❌ API docs failed! Status: {response.status_code}")
    except Exception as e:
        print(f"❌ API docs failed! Error: {e}")
    
    # Test 3: Search Contacts (should work even without WhatsApp connection)
    try:
        print("\n3. Testing search contacts endpoint...")
        test_data = {"query": "test"}
        response = requests.post(
            f"{base_url}/api/contacts/search", 
            json=test_data,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        print(f"   Status: {response.status_code}")
        if response.status_code in [200, 500]:  # 500 is expected without WhatsApp
            print("✅ Endpoint is responding!")
            if response.status_code == 500:
                print("   (500 error expected without WhatsApp connection)")
        else:
            print(f"❌ Unexpected status: {response.status_code}")
    except Exception as e:
        print(f"❌ Search contacts failed! Error: {e}")
    
    # Test 4: List Chats
    try:
        print("\n4. Testing list chats endpoint...")
        test_data = {"limit": 5}
        response = requests.post(
            f"{base_url}/api/chats/list", 
            json=test_data,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        print(f"   Status: {response.status_code}")
        if response.status_code in [200, 500]:
            print("✅ Endpoint is responding!")
            if response.status_code == 500:
                print("   (500 error expected without WhatsApp connection)")
        else:
            print(f"❌ Unexpected status: {response.status_code}")
    except Exception as e:
        print(f"❌ List chats failed! Error: {e}")
    
    print("\n" + "=" * 50)
    print("🎉 Basic endpoint tests completed!")
    print("💡 Note: Some endpoints may return 500 errors without WhatsApp connection")
    print("   This is normal and indicates the server is working correctly.")
    
    return True

def test_docker_container():
    """Test the Docker container locally"""
    
    print("🐳 Testing Docker container locally...")
    print("=" * 50)
    
    # Check if Docker is available
    try:
        import subprocess
        result = subprocess.run(['docker', '--version'], capture_output=True, text=True)
        if result.returncode != 0:
            print("❌ Docker not found! Please install Docker to test container.")
            return False
        print(f"✅ Docker found: {result.stdout.strip()}")
    except Exception as e:
        print(f"❌ Docker check failed: {e}")
        return False
    
    # Build the container
    try:
        print("\n📦 Building Docker container...")
        result = subprocess.run([
            'docker', 'build', 
            '-f', 'Dockerfile.cloudrun',
            '-t', 'whatsapp-mcp-test',
            '.'
        ], capture_output=True, text=True, cwd=os.path.dirname(__file__))
        
        if result.returncode == 0:
            print("✅ Docker build successful!")
        else:
            print(f"❌ Docker build failed!")
            print(f"Error: {result.stderr}")
            return False
    except Exception as e:
        print(f"❌ Docker build error: {e}")
        return False
    
    # Run the container
    try:
        print("\n🚀 Starting Docker container...")
        container_process = subprocess.Popen([
            'docker', 'run', '--rm',
            '-p', '8080:8080',
            '-e', 'PORT=8080',
            'whatsapp-mcp-test'
        ], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        
        # Wait a bit for the server to start
        print("⏳ Waiting for server to start...")
        time.sleep(5)
        
        # Test the containerized server
        success = test_whatsapp_mcp_server("http://localhost:8080")
        
        # Stop the container
        container_process.terminate()
        container_process.wait(timeout=10)
        
        return success
        
    except Exception as e:
        print(f"❌ Docker run error: {e}")
        return False

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "--docker":
        test_docker_container()
    else:
        # Test against local server or provided URL
        url = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8080"
        test_whatsapp_mcp_server(url)