/**
 * Test script for the robust multi-query AEO analysis
 * Tests the new Autoparse implementation with comprehensive error handling
 */

const testBrand = process.argv[2] || 'StayIQ';

async function testRobustAnalysis() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║   TESTING ROBUST MULTI-QUERY AEO ANALYSIS                 ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
  
  console.log(`🎯 Target Brand: ${testBrand}`);
  console.log(`📡 API Endpoint: http://localhost:3000/api/analyze`);
  console.log(`⏱️  Timeout: 180 seconds (3 minutes)\n`);
  
  const startTime = Date.now();
  
  try {
    console.log('🚀 Sending analysis request...\n');
    
    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 180000);
    
    const response = await fetch('http://localhost:3000/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: `${testBrand.toLowerCase()}.com`,
        brandName: testBrand
      }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    console.log(`✅ Response received in ${duration}s`);
    console.log(`📊 Status: ${response.status} ${response.statusText}\n`);
    
    const data = await response.json();
    
    // Check for graceful error handling
    if (data.error) {
      console.log('⚠️  GRACEFUL ERROR RESPONSE (200 OK with error object):');
      console.log('─────────────────────────────────────────────────────────');
      console.log(`   Message: ${data.message || 'N/A'}`);
      console.log(`   Details: ${data.details || 'N/A'}`);
      console.log(`   Step: ${data.step || 'N/A'}`);
      console.log(`   Timestamp: ${data.timestamp || 'N/A'}`);
      console.log('─────────────────────────────────────────────────────────\n');
      console.log('✅ ERROR HANDLING TEST: PASSED');
      console.log('   The API returned a graceful error response instead of crashing.\n');
      return;
    }
    
    // Success response
    if (data.success && data.report) {
      console.log('✅ SUCCESS RESPONSE:');
      console.log('═════════════════════════════════════════════════════════\n');
      
      console.log(`📋 Brand: ${data.brandName}`);
      console.log(`🌐 URL: ${data.url}`);
      console.log(`🕒 Timestamp: ${data.timestamp}\n`);
      
      // Visibility
      if (data.report.visibility) {
        console.log('👁️  VISIBILITY:');
        console.log(`   Score: ${data.report.visibility.score}/100`);
        console.log(`   Rank: ${data.report.visibility.rank || 'N/A'}`);
        console.log(`   Competitors: ${data.report.visibility.competitors?.join(', ') || 'N/A'}\n`);
      }
      
      // Sentiment
      if (data.report.sentiment) {
        console.log('💭 SENTIMENT:');
        console.log(`   Positive: ${data.report.sentiment.positive_percentage}%`);
        console.log(`   Negative: ${data.report.sentiment.negative_percentage}%`);
        console.log(`   Strengths: ${data.report.sentiment.strengths?.length || 0}`);
        console.log(`   Weaknesses: ${data.report.sentiment.weaknesses?.length || 0}\n`);
      }
      
      // Citations
      if (data.report.citations) {
        console.log('📚 CITATIONS:');
        console.log(`   Top Domains: ${data.report.citations.top_domains?.slice(0, 3).join(', ') || 'N/A'}\n`);
      }
      
      // Content Strategy
      if (data.report.content_strategy?.opportunities) {
        console.log('💡 CONTENT OPPORTUNITIES:');
        data.report.content_strategy.opportunities.slice(0, 3).forEach((opp, i) => {
          console.log(`   ${i + 1}. ${opp.title}`);
        });
        console.log('');
      }
      
      console.log('═════════════════════════════════════════════════════════');
      console.log('✅ FULL ANALYSIS TEST: PASSED');
      console.log(`   Total Duration: ${duration}s\n`);
    } else {
      console.log('⚠️  UNEXPECTED RESPONSE FORMAT:');
      console.log(JSON.stringify(data, null, 2));
    }
    
  } catch (error) {
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    console.log(`❌ REQUEST FAILED after ${duration}s\n`);
    
    if (error.name === 'AbortError') {
      console.log('⏱️  TIMEOUT: Request exceeded 180 seconds');
    } else {
      console.log('Error Details:');
      console.log('─────────────────────────────────────────────────────────');
      console.log(`   Type: ${error.name}`);
      console.log(`   Message: ${error.message}`);
      console.log('─────────────────────────────────────────────────────────');
    }
    
    console.log('\n❌ TEST FAILED: Network or fetch error\n');
  }
}

// Run the test
testRobustAnalysis().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
