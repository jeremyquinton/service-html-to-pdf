'use strict';

const chromium = require('chrome-aws-lambda');
const fs = require('fs');

module.exports.htmltopdf = async (event, context) => {

  let result = null;
  let browser = null;

    try {


        if (event.queryStringParameters.url == null) {

            let response = {
                statusCode: 400,
                body: "Request requires url parameter"
            };

            return response;
        }

        //need to validate the url
        let url = event['queryStringParameters']['url'];

        browser = await chromium.puppeteer.launch({
            args: chromium.args,
            defaultViewport: chromium.defaultViewport,
            //executablePath: await "/Users/jeremyquinton/Development/copia/html_pdf_generator/chrome-mac/chrome-mac/Chromium.app/Contents/MacOS/Chromium",
            executablePath: await chromium.executablePath,
            headless: chromium.headless,
        });

        //take in the url from the client
        //check the header of the client

        let page = await browser.newPage();
        await page.goto(url, {waitUntil: 'networkidle2'});
        const result = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: {
                left: '0px',
                top: '0px',
                right: '0px',
                bottom: '0px'
            }
        });

        // fs.writeFile("/Users/jeremyquinton/Development/copia/html_pdf_generator/service-html-to-pdf/file.pdf", result, function(err) {
        //     if(err) {
        //         return console.log(err);
        //     }
        //
        //     console.log("The file was saved!");
        // });

        let response = {
            statusCode: 200,
            headers: {'Content-type' : 'application/pdf'},
            body: result.toString('base64'),
            isBase64Encoded : true,
        };

        return response;


    } catch (error) {
        return context.fail(error);
    } finally {
        if (browser !== null) {
            await browser.close();
        }
    }
};
