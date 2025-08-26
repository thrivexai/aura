// D:\Aura\frontend\src\utils\visitorTracking.js
import { supabase } from '../lib/supabaseClient';
import { v4 as uuidv4 } from 'uuid';

// Function to track visitor
export const trackVisitor = async (req) => {
  let sessionId = getSessionId(req);
  if (!sessionId) {
    sessionId = uuidv4();
    setSessionId(req, sessionId);
  }

  const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const userAgent = req.headers['user-agent'];
  const referrer = req.headers.referer || '';
  const currentUrl = req.url;

  // Extract UTM parameters
  const utmSource = req.query.utm_source || '';
  const utmMedium = req.query.utm_medium || '';
  const utmCampaign = req.query.utm_campaign || '';
  const utmContent = req.query.utm_content || '';
  const utmTerm = req.query.utm_term || '';

  try {
    const { data, error } = await supabase
      .from('visitors')
      .select('*')
      .eq('session_id', sessionId);

    if (error) {
      console.error('Error fetching visitor data:', error);
      return;
    }

    if (data && data.length > 0) {
      // Visitor exists, update last_visit and page_views
      const visitor = data[0];
      await supabase
        .from('visitors')
        .update({
          last_visit: new Date().toISOString(),
          page_views: visitor.page_views + 1,
        })
        .eq('session_id', sessionId);
    } else {
      // New visitor, insert data
      await supabase
        .from('visitors')
        .insert([
          {
            session_id: sessionId,
            client_ip: clientIp,
            user_agent: userAgent,
            first_visit: new Date().toISOString(),
            last_visit: new Date().toISOString(),
            page_views: 1,
            utm_source: utmSource,
            utm_medium: utmMedium,
            utm_campaign: utmCampaign,
            utm_content: utmContent,
            utm_term: utmTerm,
            referrer: referrer,
          },
        ]);
    }
  } catch (error) {
    console.error('Error tracking visitor:', error);
  }
};

// Helper functions to manage session ID (example using cookies)
const getSessionId = (req) => {
  // Implement your logic to retrieve session ID from cookies or local storage
  // This is just a placeholder, you'll need to adapt it to your specific needs
  return req.cookies?.sessionId;
};

const setSessionId = (req, sessionId) => {
  // Implement your logic to set session ID in cookies or local storage
  // This is just a placeholder, you'll need to adapt it to your specific needs
  req.cookies.sessionId = sessionId;
};
