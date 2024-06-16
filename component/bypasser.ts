export async function bypassCloudflare(page: any) {
    
    let isCloudflare = await page.$('iframe[title="Widget containing a Cloudflare security challenge"]');
    let retryCount = 0;

    while (isCloudflare) {
      try {
        const checkbox = await page.$('iframe[title="Widget containing a Cloudflare security challenge"]');
        if (checkbox) {
          const frame = await checkbox.contentFrame();
          if (frame) {
            const checkBtn = await frame.$('input[type="checkbox"]');
            if (checkBtn) {
              await checkBtn.click();
            }
          }
        }

        // Check for the error message
        const errorMessage = await page.evaluate(() => {
          return document.querySelector("div:contains('taking longer')") !== null;
        });

        if (errorMessage) {
          console.log('Encountered error message, refreshing the page.');
          await page.reload({ waitUntil: ["networkidle0", "domcontentloaded"] });
          retryCount++;
          if (retryCount > 50) {
            throw new Error("Failed to bypass Cloudflare after multiple retries");
          }
        }

        await new Promise(resolve => setTimeout(resolve, 5000)); // wait for a while before checking again
      } catch (error) {
        console.error('Error while bypassing Cloudflare:', error);
        retryCount++;
        if (retryCount > 50) {
          throw new Error("Failed to bypass Cloudflare after multiple retries");
        }
        await page.reload({ waitUntil: ["networkidle0", "domcontentloaded"] });
      }

      isCloudflare = await page.$('iframe[title="Widget containing a Cloudflare security challenge"]');
    }
  }
