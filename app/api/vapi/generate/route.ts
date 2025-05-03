import { generateText } from "ai";
import { google } from "@ai-sdk/google";

import { db } from "@/firebase/admin";
import { getRandomInterviewCover } from "@/lib/utils";
import { getTechStackForRole } from "@/constants/roles";

export async function POST(request: Request) {
  try {
    // Parse request body
    const body = await request.json();
    const { type, role, level, techstack, amount, userid } = body;

    console.log("Received interview generation request:", {
      type,
      role,
      level,
      techstack,
      amount,
      userid,
    });

    // Validate required fields
    if (!type || !role || !level || !techstack || !amount || !userid) {
      console.error("Missing required fields:", {
        type,
        role,
        level,
        techstack,
        amount,
        userid,
      });
      return Response.json(
        {
          success: false,
          error: "Missing required fields",
        },
        { status: 400 }
      );
    }

    // Check Google API key
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      console.error("Google Generative AI API key is not configured");
      return Response.json(
        {
          success: false,
          error: "API key not configured",
        },
        { status: 500 }
      );
    }

    // Generate questions using Google Gemini
    console.log("Generating questions with Gemini API");

    // Get role-specific tech stack information if available
    const roleSpecificTechStack = getTechStackForRole(role);
    const combinedTechStack =
      roleSpecificTechStack.length > 0
        ? `${techstack}, and specifically: ${roleSpecificTechStack.join(", ")}`
        : techstack;

    // Add randomness to ensure different questions each time
    const currentTime = new Date().toISOString();
    const randomSeed = Math.random().toString().substring(2, 8);
    const uniqueId = Math.random().toString(36).substring(2, 15);

    const { text: questions } = await generateText({
      model: google("gemini-2.0-flash-001"),
      prompt: `Prepare unique and challenging questions for a job interview.
        The job role is ${role}.
        The job experience level is ${level}.
        The tech stack used in the job is: ${combinedTechStack}.
        The focus between behavioural and technical questions should lean towards: ${type}.
        The amount of questions required is: ${amount}.

        Important: Generate completely different questions than you've generated before. Be creative and specific.
        Include questions about recent developments and best practices in the field.
        Include questions that test both theoretical knowledge and practical experience.

        For this specific role (${role}), focus on:
        1. Role-specific technical skills and knowledge
        2. Industry-specific scenarios and problem-solving
        3. Relevant tools and technologies commonly used in this role
        4. Best practices and methodologies specific to this role

        Current timestamp for uniqueness: ${currentTime}
        Random seed: ${randomSeed}
        Unique ID: ${uniqueId}

        Please return only the questions, without any additional text.
        The questions are going to be read by a voice assistant so do not use "/" or "*" or any other special characters which might break the voice assistant.
        Return the questions formatted like this:
        ["Question 1", "Question 2", "Question 3"]

        Thank you! <3
    `,
    });

    console.log("Questions generated:", questions);

    // Parse the questions
    let parsedQuestions;
    try {
      parsedQuestions = JSON.parse(questions);
      if (!Array.isArray(parsedQuestions)) {
        throw new Error("Questions are not in array format");
      }
    } catch (parseError) {
      console.error("Error parsing questions:", parseError);
      console.error("Raw questions text:", questions);
      return Response.json(
        {
          success: false,
          error: "Failed to parse generated questions",
        },
        { status: 500 }
      );
    }

    // Create interview object
    const interview = {
      role: role,
      type: type,
      level: level,
      techstack: techstack.split(","),
      questions: parsedQuestions,
      userId: userid,
      finalized: true,
      // We'll set the coverImage after we have the document ID
      createdAt: new Date().toISOString(),
    };

    // Save to Firestore
    console.log("Saving interview to Firestore");
    const docRef = await db.collection("interviews").add(interview);
    const interviewId = docRef.id;
    console.log("Interview saved with ID:", interviewId);

    // Update the document with the cover image using the document ID
    await docRef.update({
      coverImage: getRandomInterviewCover(interviewId),
    });

    return Response.json(
      {
        success: true,
        interviewId: interviewId,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error generating interview:", error);
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return Response.json({ success: true, data: "Thank you!" }, { status: 200 });
}
