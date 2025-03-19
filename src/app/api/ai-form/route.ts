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
    let { prompt, mode, existingForm } = body;

    if (!prompt || prompt.trim() === '') {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // System prompt with available components and format instructions
    // Define base system prompt with common instructions
    const baseSystemPrompt = `
You are a form builder assistant. Your task is to create a form structure based on the user's description.
Available form components:
- textField: For single-line text input
- email: For email input
- number: For numeric input
- checkbox: For boolean selections
- radio: For single selection from multiple options
- dropdown: For single selection from a dropdown
- textarea: For multi-line text input

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

Response format:
You must respond with a valid JSON array of arrays. Each inner array represents a row in the form.
Each row contains one or more component objects.
Your response must consist solely of a valid JSON array of arrays as described. Do not include any text, explanations, or clarifying questions outside of this JSON structure. If you are unsure just return a empty array.

Example response structure:
[
  [
    {component1}, {component2}
  ],
  [
    {component3}
  ]
]
`;

    // Create mode system prompt
    const createSystemPrompt = `${baseSystemPrompt}
You must create a new form from scratch based on the user's prompt.
`;

    // Update mode system prompt
    const updateSystemPrompt = `${baseSystemPrompt}
You must update the existing form with new components as per user prompt.
Follow the existing form structure and add new components as requested.
Only remove existing components if the user prompt explicitly says to do so.
`;

    // Select the appropriate system prompt based on mode
    const systemPrompt = mode === "create" ? createSystemPrompt : updateSystemPrompt;

    if(mode === "update"){
      prompt = `existing components are ${JSON.stringify(existingForm)} the prompt is ${prompt}`;
    }

    try {
      // Call OpenAI API
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      });

      // Parse the response content
      const aiResponse = response.choices[0].message.content;
      
      if (!aiResponse) {
        throw new Error('Empty response from AI');
      }
      
      try {
        const formStructure = JSON.parse(aiResponse);
        console.log(formStructure);
        // Validate the structure is an array of arrays
        if (!Array.isArray(formStructure) || 
            formStructure.some(row => !Array.isArray(row))) {
          throw new Error('Invalid form structure format');
        }
        if(formStructure.length === 0){
          return NextResponse.json(
            { error: 'Failed to generate form with AI. Please try again with a different prompt.' },
            { status: 422 }
          );
        }
        
        return NextResponse.json(formStructure);
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