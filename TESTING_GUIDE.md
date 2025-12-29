# 🧪 Testing Guide - Sample Prompts & Expected Outputs

## Quick Test Examples

Use these sample inputs to test the structured prompt generation system.

---

## 📧 Test Case 1: Communication Type

### Input:
```
email about project update
```

### Expected Detection:
- **Type**: `communication` (detected keywords: "email")
- **Category**: Communication templates

### Expected Output (2 prompts):

**Prompt 1:**
```
Act as a Senior Communication Specialist.

**Task**: Transform the following input into a professional, clear, and actionable communication prompt.

**Context**: email about project update

**Constraints**: 
- Maintain professional tone
- Ensure clarity and conciseness
- Include specific action items

**Format**: Structured prompt with clear sections

**Goal**: Generate a communication that effectively conveys the message and prompts the desired response.
```

**Prompt 2:**
```
You are an Expert Email and Message Composer.

**Task**: Create a well-structured prompt for generating effective written communication.

**User Input**: email about project update

**Context/Constraints**: 
- Professional yet approachable tone
- Include relevant details
- Clear call-to-action

**Format**: Markdown-formatted prompt

**Goal**: Produce a communication prompt that results in clear, engaging, and actionable messages.
```

---

## 💻 Test Case 2: Technical Type

### Input:
```
write a function to sort array
```

### Expected Detection:
- **Type**: `technical` (detected keywords: "function")
- **Category**: Technical templates

### Expected Output (2 prompts):

**Prompt 1:**
```
Act as a Senior Software Engineer and Technical Architect.

**Task**: Convert the following technical requirement into a structured, executable prompt for code generation or technical documentation.

**Context**: write a function to sort array

**Constraints**:
- Follow best practices and coding standards
- Include error handling considerations
- Specify technology stack if relevant

**Format**: Technical specification with code examples

**Goal**: Generate a prompt that produces high-quality, maintainable technical solutions.
```

**Prompt 2:**
```
You are a Technical Documentation Expert.

**Task**: Structure the input into a comprehensive technical prompt.

**User Input**: write a function to sort array

**Context/Constraints**:
- Technical accuracy is paramount
- Include implementation details
- Consider scalability and performance

**Format**: Structured technical prompt with sections

**Goal**: Create a prompt that yields well-documented, production-ready technical outputs.
```

---

## 📝 Test Case 3: Content Type

### Input:
```
create a blog post about AI
```

### Expected Detection:
- **Type**: `content` (detected keywords: "create")
- **Category**: Content creation templates

### Expected Output (2 prompts):

**Prompt 1:**
```
Act as a Professional Content Strategist and Writer.

**Task**: Transform the following idea into a structured content creation prompt.

**Context**: create a blog post about AI

**Constraints**:
- Engaging and reader-friendly
- SEO considerations if applicable
- Appropriate tone for target audience

**Format**: Content brief with structure and style guidelines

**Goal**: Generate a prompt that produces high-quality, engaging content that meets the specified objectives.
```

**Prompt 2:**
```
You are a Creative Content Director.

**Task**: Structure the input into an effective content generation prompt.

**User Input**: create a blog post about AI

**Context/Constraints**:
- Creative and original approach
- Brand voice consistency
- Clear messaging hierarchy

**Format**: Creative brief with format specifications

**Goal**: Create a prompt that generates compelling, on-brand content that resonates with the audience.
```

---

## 📅 Test Case 4: Scheduling Type

### Input:
```
schedule a meeting with the team
```

### Expected Detection:
- **Type**: `scheduling` (detected keywords: "schedule", "meeting")
- **Category**: Scheduling templates

### Expected Output (2 prompts):

**Prompt 1:**
```
Act as a Professional Scheduling Coordinator.

**Task**: Convert the following scheduling need into a structured prompt for meeting or appointment coordination.

**Context**: schedule a meeting with the team

**Constraints**:
- Professional and courteous tone
- Include time zone considerations
- Provide multiple options when possible

**Format**: Scheduling request with clear time slots and agenda

**Goal**: Generate a prompt that creates effective scheduling communications that facilitate smooth coordination.
```

**Prompt 2:**
```
You are an Executive Assistant specializing in Calendar Management.

**Task**: Structure the input into a comprehensive scheduling prompt.

**User Input**: schedule a meeting with the team

**Context/Constraints**:
- Clear availability windows
- Respectful of others' time
- Include meeting purpose and duration

**Format**: Structured scheduling message with all necessary details

**Goal**: Produce a prompt that generates scheduling communications that are clear, professional, and easy to respond to.
```

---

## 🎯 Test Case 5: General Type

### Input:
```
help me with my presentation
```

### Expected Detection:
- **Type**: `general` (no specific keywords detected)
- **Category**: General prompt engineering templates

### Expected Output (2 prompts):

**Prompt 1:**
```
Act as an Expert Prompt Engineer.

**Task**: Transform the following unstructured input into a high-quality, structured prompt following best practices.

**Context**: help me with my presentation

**Constraints**:
- Clear and specific instructions
- Include necessary background information
- Define expected output format

**Format**: Structured prompt with Role, Task, Context, Format, and Goal sections

**Goal**: Generate a prompt that produces precise, high-quality outputs from any Large Language Model.
```

**Prompt 2:**
```
You are a Senior AI Prompt Specialist.

**Task**: Restructure the input into a well-organized, executable prompt.

**User Input**: help me with my presentation

**Context/Constraints**:
- Comprehensive yet concise
- Include relevant context
- Specify output requirements

**Format**: Markdown-formatted structured prompt

**Goal**: Create a prompt that enables LLMs to generate accurate, contextually appropriate, and well-formatted responses.
```

---

## 🧪 Test Case 6: Edge Cases

### Input 1: Empty or Very Short
```
hi
```

**Expected**: General type, basic structured prompts

### Input 2: Multiple Keywords
```
send email and schedule meeting about code review
```

**Expected**: First matching type (likely "communication" due to "email" appearing first)

### Input 3: Long Input
```
I need to write a comprehensive technical documentation for our new API that handles user authentication, includes error handling, and follows RESTful principles. The documentation should be clear for both developers and non-technical stakeholders.
```

**Expected**: Technical type (detected keyword: "technical")

---

## ✅ Testing Checklist

### Manual Testing Steps:

1. **Start Backend:**
   ```bash
   cd backend
   npm start
   ```

2. **Test via API (using curl or Postman):**
   ```bash
   curl -X POST http://localhost:8000/api/generate \
     -H "Content-Type: application/json" \
     -d '{"userText": "email about project update", "action": "improve"}'
   ```

3. **Expected Response Format:**
   ```json
   [
     "Act as a Senior Communication Specialist.\n\n**Task**: ...",
     "You are an Expert Email and Message Composer.\n\n**Task**: ..."
   ]
   ```

4. **Test via Extension:**
   - Load extension in Chrome
   - Open popup or floating icon
   - Enter test input
   - Verify 2 structured prompts appear

### Validation Points:

- ✅ Response is a JSON array
- ✅ Array contains exactly 2 strings
- ✅ Each string follows Role-Task-Context-Format-Goal structure
- ✅ User input is included in Context/User Input section
- ✅ Prompts are different from each other
- ✅ Appropriate template type is selected based on keywords

---

## 🔍 API Testing Examples

### Using curl:

```bash
# Test 1: Communication
curl -X POST http://localhost:8000/api/generate \
  -H "Content-Type: application/json" \
  -d '{"userText": "email about project update", "action": "improve"}'

# Test 2: Technical
curl -X POST http://localhost:8000/api/generate \
  -H "Content-Type: application/json" \
  -d '{"userText": "write a function to sort array", "action": "improve"}'

# Test 3: Content
curl -X POST http://localhost:8000/api/generate \
  -H "Content-Type: application/json" \
  -d '{"userText": "create a blog post about AI", "action": "improve"}'

# Test 4: Scheduling
curl -X POST http://localhost:8000/api/generate \
  -H "Content-Type: application/json" \
  -d '{"userText": "schedule a meeting with the team", "action": "improve"}'

# Test 5: General
curl -X POST http://localhost:8000/api/generate \
  -H "Content-Type: application/json" \
  -d '{"userText": "help me with my presentation", "action": "improve"}'
```

### Using Postman:

1. Method: `POST`
2. URL: `http://localhost:8000/api/generate`
3. Headers: `Content-Type: application/json`
4. Body (raw JSON):
   ```json
   {
     "userText": "email about project update",
     "action": "improve"
   }
   ```

---

## 📊 Expected Response Structure

All responses should follow this format:

```json
[
  "Act as a [Role].\n\n**Task**: [Task description]\n\n**Context**: [User input]\n\n**Constraints**: [List of constraints]\n\n**Format**: [Output format]\n\n**Goal**: [Goal statement]",
  "You are a [Role].\n\n**Task**: [Task description]\n\n**User Input**: [User input]\n\n**Context/Constraints**: [Constraints]\n\n**Format**: [Format]\n\n**Goal**: [Goal]"
]
```

---

## 🐛 Common Issues & Solutions

### Issue: Response not in expected format
**Solution**: Check backend logs for parsing errors

### Issue: Wrong template type selected
**Solution**: Verify keyword detection logic in `generateStructuredPrompts()`

### Issue: Prompts are identical
**Solution**: Ensure template array has 2 distinct variations

### Issue: User input not appearing in output
**Solution**: Check string interpolation `${userText}` in templates

---

## 🎯 Quick Test Script

Save this as `test-api.sh`:

```bash
#!/bin/bash

API_URL="http://localhost:8000/api/generate"

echo "Testing Communication Type..."
curl -X POST $API_URL \
  -H "Content-Type: application/json" \
  -d '{"userText": "email about project update", "action": "improve"}' | jq

echo -e "\n\nTesting Technical Type..."
curl -X POST $API_URL \
  -H "Content-Type: application/json" \
  -d '{"userText": "write a function to sort array", "action": "improve"}' | jq

echo -e "\n\nTesting Scheduling Type..."
curl -X POST $API_URL \
  -H "Content-Type: application/json" \
  -d '{"userText": "schedule a meeting", "action": "improve"}' | jq
```

Run with: `chmod +x test-api.sh && ./test-api.sh`

---

Use these examples to verify the system is working correctly! 🚀






