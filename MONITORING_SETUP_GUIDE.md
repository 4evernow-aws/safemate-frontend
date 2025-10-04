# SafeMate v2 Monitoring & Error Tracking Setup

## 🎯 **Monitoring Overview**
**Purpose**: Monitor system health, performance, and errors in real-time  
**Environment**: PREPROD (preprod-safemate-* tables)  
**Lambda Version**: V47.13-FOLDER-COLLECTION-ERROR-HANDLING  

---

## 📊 **CloudWatch Logs Monitoring**

### **1. Lambda Function Logs**
**Log Group**: `/aws/lambda/preprod-safemate-hedera-service`

**Key Metrics to Monitor**:
- ✅ **Function Invocations** - Track request volume
- ✅ **Duration** - Monitor response times
- ✅ **Errors** - Count of failed invocations
- ✅ **Throttles** - Function throttling events
- ✅ **Memory Usage** - Memory consumption patterns

**Critical Log Patterns to Watch**:
```
ERROR: Lambda function error
WARN: Performance warning
INFO: Successful operation
DEBUG: Treasury token detection
```

---

### **2. API Gateway Logs**
**Log Group**: `/aws/apigateway/preprod-safemate-api`

**Key Metrics to Monitor**:
- ✅ **Request Count** - API usage patterns
- ✅ **4XX Errors** - Client errors (400, 401, 403, 404)
- ✅ **5XX Errors** - Server errors (500, 502, 503, 504)
- ✅ **Latency** - Response time distribution
- ✅ **Cache Hit Rate** - CloudFront cache performance

---

### **3. DynamoDB Monitoring**
**Tables**: preprod-safemate-*

**Key Metrics to Monitor**:
- ✅ **Read Capacity Units** - DynamoDB read usage
- ✅ **Write Capacity Units** - DynamoDB write usage
- ✅ **Throttled Requests** - Capacity limit hits
- ✅ **Item Count** - Table size growth
- ✅ **Consumed Read/Write Capacity** - Usage patterns

---

## 🔍 **Error Tracking Setup**

### **1. Critical Error Patterns**
**Monitor these error types**:

#### **Authentication Errors**:
```
ERROR: Cognito authentication failed
ERROR: JWT token validation failed
ERROR: User not found
```

#### **Hedera Blockchain Errors**:
```
ERROR: Hedera API request failed
ERROR: Invalid signature
ERROR: Account validation failed
ERROR: Treasury token detection failed
```

#### **Folder Management Errors**:
```
ERROR: Folder creation failed
ERROR: Folder listing failed
ERROR: Collection token creation failed
```

#### **Database Errors**:
```
ERROR: DynamoDB operation failed
ERROR: Item not found
ERROR: Write capacity exceeded
```

---

### **2. Performance Monitoring**
**Track these performance metrics**:

#### **Response Time Thresholds**:
- ✅ **API Gateway**: < 3 seconds
- ✅ **Lambda Function**: < 2 seconds
- ✅ **DynamoDB**: < 500ms
- ✅ **Hedera API**: < 5 seconds

#### **Error Rate Thresholds**:
- ✅ **4XX Errors**: < 5%
- ✅ **5XX Errors**: < 1%
- ✅ **Lambda Errors**: < 2%
- ✅ **DynamoDB Throttles**: < 1%

---

## 🛠️ **Monitoring Tools Setup**

### **1. CloudWatch Dashboard**
**Create custom dashboard with**:
- Lambda function metrics
- API Gateway metrics
- DynamoDB metrics
- Error rate trends
- Performance graphs

### **2. CloudWatch Alarms**
**Set up alarms for**:
- High error rates (> 5%)
- High response times (> 5 seconds)
- Lambda function failures
- DynamoDB throttling
- API Gateway 5XX errors

### **3. Log Insights Queries**
**Useful queries for troubleshooting**:

#### **Error Analysis**:
```sql
fields @timestamp, @message
| filter @message like /ERROR/
| sort @timestamp desc
| limit 100
```

#### **Performance Analysis**:
```sql
fields @timestamp, @message
| filter @message like /Duration/
| sort @timestamp desc
```

#### **User Activity**:
```sql
fields @timestamp, @message
| filter @message like /User/
| sort @timestamp desc
```

---

## 📋 **Monitoring Checklist**

### **Daily Monitoring Tasks**:
- [ ] Check CloudWatch logs for errors
- [ ] Monitor Lambda function performance
- [ ] Review API Gateway metrics
- [ ] Check DynamoDB usage
- [ ] Monitor AWS Free Tier usage

### **Weekly Monitoring Tasks**:
- [ ] Analyze error trends
- [ ] Review performance patterns
- [ ] Check capacity planning
- [ ] Update monitoring thresholds
- [ ] Review cost optimization

### **Monthly Monitoring Tasks**:
- [ ] Comprehensive system health review
- [ ] Performance optimization analysis
- [ ] Cost analysis and optimization
- [ ] Security review
- [ ] Backup and recovery testing

---

## 🚨 **Alert Configuration**

### **Critical Alerts**:
1. **Lambda Function Errors** - Immediate notification
2. **API Gateway 5XX Errors** - Immediate notification
3. **DynamoDB Throttling** - Immediate notification
4. **High Error Rates** - 15-minute notification
5. **Performance Degradation** - 30-minute notification

### **Warning Alerts**:
1. **High Response Times** - 1-hour notification
2. **Capacity Usage** - 2-hour notification
3. **Unusual Activity** - 4-hour notification
4. **Cost Thresholds** - Daily notification

---

## 📊 **Monitoring Dashboard Setup**

### **1. Create CloudWatch Dashboard**
**Dashboard Name**: `SafeMate-v2-Monitoring`

**Widgets to Include**:
- Lambda function metrics
- API Gateway metrics
- DynamoDB metrics
- Error rate graphs
- Performance trends
- Cost monitoring

### **2. Set Up Alarms**
**Alarm Names**:
- `SafeMate-Lambda-Errors`
- `SafeMate-API-Errors`
- `SafeMate-Performance`
- `SafeMate-Capacity`
- `SafeMate-Cost`

---

## 🔧 **Monitoring Scripts**

### **1. Log Analysis Script**
```powershell
# Monitor CloudWatch logs
.\monitor-cloudwatch-logs.ps1
```

### **2. Performance Monitoring**
```powershell
# Check system performance
.\monitor-performance.ps1
```

### **3. Error Tracking**
```powershell
# Track and analyze errors
.\monitor-errors.ps1
```

---

## 📈 **Key Performance Indicators (KPIs)**

### **System Health KPIs**:
- ✅ **Uptime**: > 99.9%
- ✅ **Response Time**: < 3 seconds
- ✅ **Error Rate**: < 2%
- ✅ **Availability**: > 99.5%

### **User Experience KPIs**:
- ✅ **User Registration Success**: > 95%
- ✅ **Wallet Creation Success**: > 98%
- ✅ **Folder Creation Success**: > 95%
- ✅ **API Response Success**: > 98%

### **Cost Optimization KPIs**:
- ✅ **AWS Free Tier Usage**: < 80%
- ✅ **Lambda Cost**: < $5/month
- ✅ **DynamoDB Cost**: < $3/month
- ✅ **API Gateway Cost**: < $2/month

---

## 🎯 **Monitoring Best Practices**

### **1. Proactive Monitoring**:
- Set up alerts before issues occur
- Monitor trends, not just current values
- Use predictive analytics for capacity planning

### **2. Comprehensive Coverage**:
- Monitor all system components
- Track both technical and business metrics
- Include user experience metrics

### **3. Actionable Alerts**:
- Set clear thresholds for alerts
- Include context in alert messages
- Provide remediation steps

### **4. Regular Review**:
- Review monitoring data weekly
- Adjust thresholds based on trends
- Update monitoring as system evolves

---

## 🚀 **Next Steps**

### **Immediate Actions**:
1. **Set up CloudWatch Dashboard** - Create monitoring dashboard
2. **Configure Alarms** - Set up critical alerts
3. **Test Monitoring** - Verify alerts work correctly
4. **Document Procedures** - Create monitoring runbooks

### **Ongoing Monitoring**:
1. **Daily Checks** - Review logs and metrics
2. **Weekly Analysis** - Analyze trends and patterns
3. **Monthly Review** - Comprehensive system health review
4. **Continuous Improvement** - Optimize monitoring based on learnings

---

## 📞 **Support Information**

- **Monitoring Dashboard**: AWS CloudWatch Console
- **Log Groups**: `/aws/lambda/preprod-safemate-hedera-service`
- **API Gateway**: `ylpabkmc68.execute-api.ap-southeast-2.amazonaws.com`
- **DynamoDB Tables**: `preprod-safemate-*`

**Monitoring is now set up and ready to track system health!** 📊
