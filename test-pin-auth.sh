#!/bin/bash

echo "🧪 Testing PIN Authorization on PUT /api/venues/:slug"
echo "=================================================="
echo ""

echo "✅ Test 1: Create venue with PIN (should succeed)"
echo "---------------------------------------------------"
curl -s -w "\nHTTP Status: %{http_code}\n" -X PUT http://localhost:3000/api/venues/test-venue-123 \
  -H "Content-Type: application/json" \
  -d '{"venue_data":{"shapes":[],"guests":[],"eventTitle":"Test Event","tableCounter":1},"pin":"1234"}'
echo -e "\n"

sleep 1

echo "✅ Test 2: Update with CORRECT PIN (should succeed)"
echo "---------------------------------------------------"
curl -s -w "\nHTTP Status: %{http_code}\n" -X PUT http://localhost:3000/api/venues/test-venue-123 \
  -H "Content-Type: application/json" \
  -d '{"venue_data":{"shapes":[],"guests":[],"eventTitle":"Updated Title","tableCounter":2},"pin":"1234"}'
echo -e "\n"

sleep 1

echo "❌ Test 3: Update with WRONG PIN (should fail with 403)"
echo "---------------------------------------------------"
curl -s -w "\nHTTP Status: %{http_code}\n" -X PUT http://localhost:3000/api/venues/test-venue-123 \
  -H "Content-Type: application/json" \
  -d '{"venue_data":{"shapes":[],"guests":[],"eventTitle":"Hacked Title","tableCounter":999},"pin":"9999"}'
echo -e "\n"

sleep 1

echo "❌ Test 4: Update WITHOUT PIN (should fail with 401)"
echo "---------------------------------------------------"
curl -s -w "\nHTTP Status: %{http_code}\n" -X PUT http://localhost:3000/api/venues/test-venue-123 \
  -H "Content-Type: application/json" \
  -d '{"venue_data":{"shapes":[],"guests":[],"eventTitle":"No PIN Attack","tableCounter":888}}'
echo -e "\n"

sleep 1

echo "✅ Test 5: Create venue WITHOUT PIN (should succeed - backwards compatibility)"
echo "---------------------------------------------------"
curl -s -w "\nHTTP Status: %{http_code}\n" -X PUT http://localhost:3000/api/venues/no-pin-venue-456 \
  -H "Content-Type: application/json" \
  -d '{"venue_data":{"shapes":[],"guests":[],"eventTitle":"Public Event","tableCounter":1}}'
echo -e "\n"

echo "=================================================="
echo "Test Summary:"
echo "- Tests 1, 2, 5 should show HTTP Status: 200"
echo "- Test 3 should show HTTP Status: 403 (Invalid PIN)"
echo "- Test 4 should show HTTP Status: 401 (PIN required)"
