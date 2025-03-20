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
    const { prompt, existingForm, previousAIMessage } = body;

    if (!prompt || prompt.trim() === '') {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }
    const aiPrompt = generatePrompt(prompt, existingForm, previousAIMessage);

    const systemPrompt = `
You are a form builder assistant specialized in creating forms with Kendo React components. Your task is to create form structures based on user descriptions and provide brief, relevant feedback.

## Available Form Components
- textField: For single-line text input
- email: For email input
- number: For numeric input
- checkbox: For boolean selections
- radio: For single selection from multiple options
- dropdown: For single selection from a dropdown
- textarea: For multi-line text input

## Component Properties
Each component has the following properties:
- id: A unique identifier (use UUID format)
- type: One of the component types listed above
- label: The display label for the field
- componentName: The formal name of the component (Text Field, Email Field, Number Field, Checkbox, Radio Button, Dropdown, Textarea)
- name: The field name (usually lowercase, no spaces)
- className: CSS class (usually "form-control")
- placeholder: Placeholder text for input fields
- required: Boolean indicating if the field is required
- options: For radio and dropdown, an array of {label, value} objects

## Response Format
Your response must include:
1. A valid JSON array of arrays representing the form structure, Each inner array represents a row in the form. Each row contains one or more component objects.
2. A brief message with feedback or suggestion to improve the form

Example response:
{
  "formStructure": [
    [
      {component1},
      {component2}
    ],
    [
      {component3}
    ]
  ],
  "message": "Form created. Consider adding specific names for the fields to improve data handling."
}

Keep your feedback concise and directly related to improving the form structure. Do not provide code examples or explanations unless specifically requested.
`;

// Function to process the request with existing form if available
function generatePrompt(userPrompt: string, existingForm: any, previousAIMessage: string) {
  let prompt = "";
  
  if (existingForm) {
    prompt += `\n\n## Existing Form\n${JSON.stringify(existingForm)}`;
  }
  
  prompt += `\n\n## User Request\n${userPrompt}`;
  
  return prompt;
}


    try {
      // Call OpenAI API
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo-0125",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: aiPrompt },
          { role: "assistant", content: previousAIMessage? previousAIMessage : "" }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      });

      // Parse the response content
      const aiResponse = response.choices[0].message.content;
      console.log(aiResponse);
      if (!aiResponse) {
        throw new Error('Empty response from AI');
      }
      
      try {
        const responseObj = JSON.parse(aiResponse);
        
        // Check if the response has the expected format
        if (!responseObj.formStructure || !Array.isArray(responseObj.formStructure)) {
          throw new Error('Invalid form structure format');
        }
        
        // Validate the structure is an array of arrays
        if (responseObj.formStructure.some((row: any) => !Array.isArray(row))) {
          throw new Error('Invalid form structure format');
        }
        
        if (responseObj.formStructure.length === 0) {
          return NextResponse.json(
            { error: 'Failed to generate form with AI. Please try again with a different prompt.' },
            { status: 422 }
          );
        }
        
        // Return both the form structure and the message
        return NextResponse.json({
          formStructure: responseObj.formStructure,
          message: responseObj.message || ''
        });
      } catch (parseError) {
        return NextResponse.json(
          { error: 'Failed to generate form with AI. Please try again with a different prompt.' },
          { status: 422 }
        );
      }
    } catch (aiError) {
      return NextResponse.json(
        { error: 'Failed to generate form with AI. Please try again with a different prompt.' },
        { status: 503 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to process form generation request' },
      { status: 500 }
    );
  }
} 