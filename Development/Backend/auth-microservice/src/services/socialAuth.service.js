const https = require('https');

// Verify Google access token
const verifyGoogleToken = async (accessToken) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'www.googleapis.com',
      port: 443,
      path: `/oauth2/v1/userinfo?access_token=${accessToken}`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          if (res.statusCode === 200) {
            const userInfo = JSON.parse(data);
            
            // Verify token is valid and has required fields
            if (userInfo.id && userInfo.email && userInfo.verified_email) {
              resolve({
                id: userInfo.id,
                email: userInfo.email,
                name: userInfo.name,
                picture: userInfo.picture
              });
            } else {
              resolve(null);
            }
          } else {
            console.error('Google token verification failed:', res.statusCode, data);
            resolve(null);
          }
        } catch (error) {
          console.error('Error parsing Google response:', error);
          resolve(null);
        }
      });
    });

    req.on('error', (error) => {
      console.error('Google token verification error:', error);
      resolve(null);
    });

    req.setTimeout(10000, () => {
      req.destroy();
      console.error('Google token verification timeout');
      resolve(null);
    });

    req.end();
  });
};

// Verify Facebook access token
const verifyFacebookToken = async (accessToken) => {
  return new Promise((resolve, reject) => {
    const appId = process.env.FACEBOOK_APP_ID;
    const appSecret = process.env.FACEBOOK_APP_SECRET;
    
    // First, verify the token with Facebook
    const verifyOptions = {
      hostname: 'graph.facebook.com',
      port: 443,
      path: `/debug_token?input_token=${accessToken}&access_token=${appId}|${appSecret}`,
      method: 'GET'
    };

    const verifyReq = https.request(verifyOptions, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const verifyResult = JSON.parse(data);
          
          if (verifyResult.data && verifyResult.data.is_valid && verifyResult.data.app_id === appId) {
            // Token is valid, now get user info
            const userOptions = {
              hostname: 'graph.facebook.com',
              port: 443,
              path: `/me?fields=id,email,name,picture&access_token=${accessToken}`,
              method: 'GET'
            };

            const userReq = https.request(userOptions, (userRes) => {
              let userData = '';

              userRes.on('data', (chunk) => {
                userData += chunk;
              });

              userRes.on('end', () => {
                try {
                  if (userRes.statusCode === 200) {
                    const userInfo = JSON.parse(userData);
                    
                    if (userInfo.id && userInfo.email) {
                      resolve({
                        id: userInfo.id,
                        email: userInfo.email,
                        name: userInfo.name,
                        picture: userInfo.picture ? userInfo.picture.data.url : null
                      });
                    } else {
                      resolve(null);
                    }
                  } else {
                    console.error('Facebook user info failed:', userRes.statusCode, userData);
                    resolve(null);
                  }
                } catch (error) {
                  console.error('Error parsing Facebook user response:', error);
                  resolve(null);
                }
              });
            });

            userReq.on('error', (error) => {
              console.error('Facebook user info error:', error);
              resolve(null);
            });

            userReq.setTimeout(10000, () => {
              userReq.destroy();
              resolve(null);
            });

            userReq.end();
          } else {
            console.error('Facebook token verification failed:', verifyResult);
            resolve(null);
          }
        } catch (error) {
          console.error('Error parsing Facebook verify response:', error);
          resolve(null);
        }
      });
    });

    verifyReq.on('error', (error) => {
      console.error('Facebook token verification error:', error);
      resolve(null);
    });

    verifyReq.setTimeout(10000, () => {
      verifyReq.destroy();
      resolve(null);
    });

    verifyReq.end();
  });
};

module.exports = {
  verifyGoogleToken,
  verifyFacebookToken
};