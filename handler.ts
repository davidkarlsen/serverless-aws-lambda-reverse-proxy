import { ALBEvent, ALBHandler, ALBResult } from 'aws-lambda';
import fetch, { RequestInfo, RequestInit, Response } from 'node-fetch';

export const handler: ALBHandler = async(event: ALBEvent, context): Promise<ALBResult> => {

  console.debug('event received: ' + JSON.stringify(event));
  console.debug('context received: ' + JSON.stringify(context));

  // fetch Headers and ALB Headers are different types
  const customUrl = 'app1.terra10.nl';
  let customRequestHeader: { [header: string]: string } = [''][''];
  if ( event.headers ) {
    customRequestHeader = event.headers;
  }
  customRequestHeader['host'] = customUrl;
  customRequestHeader['proxyRequestId'] = context.awsRequestId;
  console.debug('request customHeader: ' + JSON.stringify(customRequestHeader));

  // perform fetch to https target
  try {
    const url: RequestInfo = `https://${customUrl}${event.path}`;
    const params: RequestInit = {
      method: event.httpMethod,
      headers: customRequestHeader
    };

    console.debug('request params: ' + JSON.stringify(params));
    const response: Response = await fetch(url, params);
    const textResponse = await response.text();
    console.debug('response text: ' + textResponse);

    // fetch Headers and ALB Headers are different types so code if you need Header manipulation on the response
        // console.log('response headers: ' + JSON.stringify(response.headers));
        // const customResponseHeader: { [header: string]: boolean | number | string } = { proxyRequestId: context.awsRequestId } ;
        // for (const pair of response.headers.entries()) {
        //   customResponseHeader.pair[0] = pair[1];
        // }
        // console.debug('response customHeader: ' + JSON.stringify(customResponseHeader));

    return {
      statusCode: response.status,
      statusDescription: response.statusText,
      isBase64Encoded: false,
      headers: event.headers,
      // headers: customResponseHeader,
      body: textResponse
    };
  } catch (err) {
      console.error(`Unexpected 500 | ${err.message} | ${err.detail}`);
      return {
        statusCode: 500,
        statusDescription: '500',
        isBase64Encoded: false,
        headers: event.headers,
        body: err.message
      };
  }
};
