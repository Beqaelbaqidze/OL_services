export class WFSRequestHandler {
    constructor(version, workspace, baseUrl) {
      this.version = version;
      this.workspace = workspace;
      this.baseUrl = baseUrl;
    }
  
    // GetCapabilities request: Available in all versions
    getCapabilities() {
      const url = `${this.baseUrl}?service=WFS&version=${this.version}&request=GetCapabilities`;
      return this.sendRequest(url);
    }
  
    // DescribeFeatureType request: Available in all versions
    describeFeatureType(featureName) {
      const url = `${this.baseUrl}?service=WFS&version=${this.version}&request=DescribeFeatureType&typeName=${this.workspace}:${featureName}`;
      return this.sendRequest(url);
    }
  
    // GetFeature request: Available in all versions
    getFeature(featureName) {
      const url = `${this.baseUrl}?service=WFS&version=${this.version}&request=GetFeature&typeName=${this.workspace}:${featureName}&outputFormat=application/json`;
      return this.sendRequest(url);
    }
  
    // LockFeature request: Available in all versions
    lockFeature(featureName, filter) {
      const url = `${this.baseUrl}?service=WFS&version=${this.version}&request=LockFeature&typeName=${this.workspace}:${featureName}&filter=${filter}`;
      return this.sendRequest(url);
    }
  
    // Transaction request (for Create, Update, Delete): Available in all versions
    transaction(xmlBody) {
      const url = `${this.baseUrl}?service=WFS&version=${this.version}&request=Transaction`;
      return this.sendRequest(url, xmlBody, "POST");
    }
  
    // WFS 2.0.0 Only Operations
    // GetFeatureWithLock request: Version 2.0.0 only
    getFeatureWithLock(featureName, filter) {
      const url = `${this.baseUrl}?service=WFS&version=2.0.0&request=GetFeatureWithLock&typeName=${this.workspace}:${featureName}&filter=${filter}`;
      return this.sendRequest(url);
    }
  
    // GetPropertyValue request: Version 2.0.0 only
    getPropertyValue(featureName, propertyName) {
      const url = `${this.baseUrl}?service=WFS&version=2.0.0&request=GetPropertyValue&typeName=${this.workspace}:${featureName}&valueReference=${propertyName}`;
      return this.sendRequest(url);
    }
  
    // CreateStoredQuery request: Version 2.0.0 only
    createStoredQuery(queryXML) {
      const url = `${this.baseUrl}?service=WFS&version=2.0.0&request=CreateStoredQuery`;
      return this.sendRequest(url, queryXML, "POST");
    }
  
    // DropStoredQuery request: Version 2.0.0 only
    dropStoredQuery(queryId) {
      const url = `${this.baseUrl}?service=WFS&version=2.0.0&request=DropStoredQuery&storedQueryId=${queryId}`;
      return this.sendRequest(url, null, "POST");
    }
  
    // ListStoredQueries request: Version 2.0.0 only
    listStoredQueries() {
      const url = `${this.baseUrl}?service=WFS&version=2.0.0&request=ListStoredQueries`;
      return this.sendRequest(url);
    }
  
    // DescribeStoredQueries request: Version 2.0.0 only
    describeStoredQueries(queryId) {
      const url = `${this.baseUrl}?service=WFS&version=2.0.0&request=DescribeStoredQueries&storedQueryId=${queryId}`;
      return this.sendRequest(url);
    }
  
    // WFS 1.1.0 Only Operations
    // GetGMLObject request: Version 1.1.0 only
    getGMLObject(featureId) {
      const url = `${this.baseUrl}?service=WFS&version=1.1.0&request=GetGMLObject&gmlObjectId=${featureId}`;
      return this.sendRequest(url);
    }
  
    // Helper method to send requests (supports GET and POST)
    async sendRequest(url, body = null, method = "GET") {
      const options = {
        method: method,
        headers: {
          "Content-Type": "application/xml",
        },
      };
      if (method === "POST" && body) {
        options.body = body;
      }
  
      try {
        const response = await fetch(url, options);
        const contentType = response.headers.get("content-type");
  
        // Handle JSON responses
        if (contentType && contentType.includes("application/json")) {
          return await response.json();
        }
        
        // Handle XML responses (such as errors)
        if (contentType && (contentType.includes("application/xml") || contentType.includes("text/xml"))) {
          const text = await response.text();
          console.error("Received XML error:", text); // Log XML error to the console
          return text; // Return the XML as text
        }
  
        // Handle any other response types
        const text = await response.text();
        console.error("Unexpected response format:", text);
        return text;
  
      } catch (error) {
        console.error("Error in WFS request:", error);
        throw error;
      }
    }
  }
  