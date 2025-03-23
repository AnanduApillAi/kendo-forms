import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

export async function GET() {
  // Predefined form structure to return
  const formStructure = [
    [
        {
            "id": "b450eb41-c72e-4003-b4f8-3e36559868a8",
            "type": "textField",
            "label": "Text Field",
            "componentName": "Text Field",
            "name": "textField",
            "className": "form-control",
            "placeholder": "Enter text...",
            "required": false,
            "width": "50%"
        },
        {
            "id": "d25969f4-f143-43f0-8d1a-b9759c5b9567",
            "type": "number",
            "componentName": "Number Field",
            "label": "Number",
            "name": "number",
            "className": "form-control",
            "placeholder": "Enter number...",
            "required": false,
            "width": "50%"
        }
    ],
    [
        {
            "id": "8cd5211c-a6d3-4622-a16f-a03a931ffe59",
            "type": "email",
            "label": "Email",
            "componentName": "Email Field",
            "name": "email",
            "className": "form-control",
            "placeholder": "Enter email...",
            "required": false,
            "width": "100%"
        }
    ]
  ];

  return NextResponse.json(formStructure);
}

export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json();
    const { prompt, existingForm, previousAIMessage, conversationHistory = [] } = body;

    if (!prompt || prompt.trim() === '') {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Keep only the last 5 messages for context
    const recentHistory = conversationHistory.slice(-5);
    
    const aiPrompt = generatePrompt(prompt, existingForm, recentHistory);

    const systemPrompt = `
You are a form builder assistant specialized in creating forms with Kendo React components. Your task is to create form structures based on user descriptions and provide brief, relevant feedback.

## Context Awareness
- You maintain context from the last 5 interactions
- Reference previous form modifications when relevant
- Build upon previous suggestions and improvements
- Acknowledge user's previous choices and preferences

## Available Form Components
- textField: For single-line text input (componentName: "Text Field")
- email: For email input (componentName: "Email Field")
- number: For numeric input (componentName: "Number Field")
- checkbox: For boolean selections (componentName: "Checkbox")
- radio: For single selection from multiple options (componentName: "Radio Button")
- dropdown: For single selection from a dropdown (componentName: "Dropdown")
- textarea: For multi-line text input (componentName: "Textarea")

## Component Properties
Each component MUST include ALL of these properties:
- id: A unique identifier (use UUID format)
- type: One of the component types listed above
- label: The display label for the field
- componentName: The formal name of the component (REQUIRED, must match the names specified above)
- name: The field name (usually lowercase, no spaces)
- className: CSS class (always use "form-control")
- placeholder: Placeholder text for input fields
- required: Boolean indicating if the field is required
- options: For radio and dropdown only, an array of {label, value} objects

## Response Format (STRICT)
- Your response MUST ALWAYS be a valid JSON object.
- If no form structure is generated, return an empty "formStructure" array.
- "message" field must always be present in the response.
- DO NOT return natural language outside the JSON object.

### Example response:
\`\`\`json
{
  "formStructure": [
    [
      {
        "id": "b450eb41-c72e-4003-b4f8-3e36559868a8",
        "type": "textField",
        "label": "Full Name",
        "componentName": "Text Field",
        "name": "fullName",
        "className": "form-control",
        "placeholder": "Enter your full name",
        "required": false
      },
      {
        "id": "d25969f4-f143-43f0-8d1a-b9759c5b9567",
        "type": "email",
        "label": "Email Address",
        "componentName": "Email Field",
        "name": "email",
        "className": "form-control",
        "placeholder": "Enter your email",
        "required": true
      }
    ]
  ],
  "message": "I've created a form with name and email fields. The email is required for contact purposes."
}
\`\`\`

## Message Guidelines
- If the user greets you: Respond warmly while maintaining context of any previous form discussions
- If the user requests a form: Reference any relevant previous forms or preferences from the conversation history
- If the user asks questions: Provide context-aware explanations based on previous interactions
- Keep responses concise and focused on form building
- Acknowledge and build upon previous interactions when relevant
- If you are unable to generate a form, return:
\`\`\`json
{
  "formStructure": [],
  "message": "I couldn't generate a form based on the input. Please clarify your request."
}
\`\`\`
`;



// Function to process the request with existing form and conversation history
function generatePrompt(userPrompt: string, existingForm: any, conversationHistory: any[]) {
  let prompt = "";
  
  // Add conversation history context
  if (conversationHistory.length > 0) {
    prompt += "\n\n## Recent Conversation History\n";
    conversationHistory.forEach((msg: any, index: number) => {
      prompt += `${index + 1}. ${msg.role}: ${msg.content}\n`;
    });
  }
  
  if (existingForm) {
    prompt += `\n\n## Existing Form\n${JSON.stringify(existingForm)}`;
  }
  
  prompt += `\n\n## Current Request\n${userPrompt}`;
  
  return prompt;
}

    try {
      // Prepare conversation messages including history
      const messages = [
        { role: "system", content: systemPrompt },
        ...recentHistory.map((msg: any) => ({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content
        })),
        { role: "user", content: aiPrompt }
      ];

      // Call OpenAI API
      const response = await openai.chat.completions.create({
        model: "gpt-4-0613",
        messages: messages,
        temperature: 0.7,
        max_tokens: 1000,
      });

      // Parse the response content
      const aiResponse = response.choices[0].message.content;
      console.log('AI Response:', aiResponse);
      if (!aiResponse) {
        throw new Error('Empty response from AI');
      }
      
      try {
        // Try to parse as JSON first
        let responseObj;
        try {
          responseObj = JSON.parse(aiResponse);
        } catch (jsonError) {
          // If it's not JSON, assume it's a plain message and format it
          console.log('Response is not JSON, formatting as message');
          responseObj = {
            formStructure: [],
            message: aiResponse.trim()
          };
        }
        
        // Initialize default response structure
        let formattedResponse = {
          formStructure: [],
          message: ''
        };

        // If the response has a valid form structure, use it
        if (responseObj.formStructure && Array.isArray(responseObj.formStructure)) {
          // Validate that each row is an array
          if (responseObj.formStructure.every((row: any) => Array.isArray(row))) {
            formattedResponse.formStructure = responseObj.formStructure;
          }
        }

        // Always include a message
        formattedResponse.message = responseObj.message || 'I understand your request.';
        
        // Return both the form structure and the message
        return NextResponse.json(formattedResponse);
      } catch (parseError) {
        console.error('Parse error:', parseError);
        // If all parsing fails, return a structured response with empty form and error message
        return NextResponse.json({
          formStructure: [],
          message: 'I understood your message, but I cannot modify the form at this time.'
        });
      }
    } catch (aiError) {
      console.error('AI error:', aiError);
      return NextResponse.json(
        { 
          formStructure: [],
          message: 'Failed to process your request. Please try again with a different prompt.'
        },
        { status: 503 }
      );
    }
  } catch (error) {
    console.error('Request error:', error);
    return NextResponse.json(
      { 
        formStructure: [],
        message: 'Failed to process form generation request'
      },
      { status: 500 }
    );
  }
} 