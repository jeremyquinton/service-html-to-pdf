'use strict';

const chromium = require('chrome-aws-lambda');
const fs = require('fs');
const AWS = require('aws-sdk');

module.exports.htmltopdf = async (event, context) => {

    let browser = null;

    try {

        if (event.httpMethod == "OPTIONS") {
            let response = {
                statusCode: 200,
                headers:
                {
                "Access-Control-Allow-Origin":'*',
                "Access-Control-Allow-Credentials":true,
                "Access-Control-Allow-Methods":"OPTIONS,POST",
                "Access-Control-Allow-Headers":"Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent",
                "Content-Type":"application/json"
                },
                body: '',
                isBase64Encoded : true,
            };

            return response;
        }

        //in the serverless.yml we specify binaryMediaTypes: */* which means that the incoming data body is
        //also base64 decoded. Even setting Accept-type and Content-Type on the client does not help.
        //therefore its based 64 in and base 64 out.
        var buf = Buffer.from(event.body, 'base64');
        const data = JSON.parse(buf);

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
        await page.setContent(data.html)
        const result = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: {
                left: '10mm',
                top: '10mm',
                right: '10mm',
                bottom: '10mm'
            }
        });

        let response = {
            statusCode: 200,
            headers: {
                'Content-type' : 'application/pdf',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true,
            },
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

module.exports.urltopdf = async (event, context) => {

    let browser = null;

    try {

        var buf = Buffer.from(event.body, 'base64');
        const data = JSON.parse(buf);

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
        await page.goto(data.url, {waitUntil: 'networkidle2'});
        const result = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: {
                left: '10mm',
                top: '10mm',
                right: '10mm',
                bottom: '10mm'
            }
        });

        let response = {
            statusCode: 200,
            headers: {
                'Content-type' : 'application/pdf',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true,
            },
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