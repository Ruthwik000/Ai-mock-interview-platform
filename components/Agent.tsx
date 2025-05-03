"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

import { cn } from "@/lib/utils";
import { interviewer } from "@/constants";
import { createFeedback } from "@/lib/actions/general.action";

// Import vapi only on the client side
import { vapi } from "@/lib/vapi.sdk";

enum CallStatus {
  INACTIVE = "INACTIVE",
  CONNECTING = "CONNECTING",
  ACTIVE = "ACTIVE",
  FINISHED = "FINISHED",
}

interface SavedMessage {
  role: "user" | "system" | "assistant";
  content: string;
}

const Agent = ({
  userName,
  userId,
  interviewId,
  feedbackId,
  type,
  questions,
}: AgentProps) => {
  const router = useRouter();
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [messages, setMessages] = useState<SavedMessage[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastMessage, setLastMessage] = useState<string>("");

  // State to store interview requirements from voice interaction
  const [interviewRequirements, setInterviewRequirements] = useState({
    type: "",
    role: "",
    level: "",
    techstack: "",
    amount: "",
  });

  useEffect(() => {
    const onCallStart = () => {
      setCallStatus(CallStatus.ACTIVE);
    };

    const onCallEnd = () => {
      console.log("Call ended, setting status to FINISHED");
      console.log("Current interview requirements:", interviewRequirements);

      // Ensure we have default values for any missing requirements
      const updatedRequirements = {
        type: interviewRequirements.type || "Technical",
        role: interviewRequirements.role || "Software Developer",
        level: interviewRequirements.level || "Mid-level",
        techstack:
          interviewRequirements.techstack || "JavaScript, React, Node.js",
        amount: interviewRequirements.amount || "5",
      };

      console.log("Final interview requirements:", updatedRequirements);
      setInterviewRequirements(updatedRequirements);

      // Set call status to finished to trigger the useEffect that handles interview generation
      setCallStatus(CallStatus.FINISHED);
    };

    const onMessage = (message: Message) => {
      if (message.type === "transcript" && message.transcriptType === "final") {
        console.log("Received message:", message);
        const newMessage = { role: message.role, content: message.transcript };
        setMessages((prev) => [...prev, newMessage]);

        // Parse interview requirements from the conversation
        if (type === "generate" && message.role === "user") {
          console.log(
            "Parsing user message for requirements:",
            message.transcript
          );
          const transcript = message.transcript.toLowerCase();

          // Extract interview type
          if (transcript.includes("technical")) {
            console.log("Detected technical interview type");
            setInterviewRequirements((prev) => {
              const updated = { ...prev, type: "Technical" };
              console.log("Updated requirements (type):", updated);
              return updated;
            });
          } else if (
            transcript.includes("behavioral") ||
            transcript.includes("behavioural")
          ) {
            console.log("Detected behavioral interview type");
            setInterviewRequirements((prev) => {
              const updated = { ...prev, type: "Behavioral" };
              console.log("Updated requirements (type):", updated);
              return updated;
            });
          } else if (transcript.includes("mixed")) {
            console.log("Detected mixed interview type");
            setInterviewRequirements((prev) => {
              const updated = { ...prev, type: "Mixed" };
              console.log("Updated requirements (type):", updated);
              return updated;
            });
          }

          // Extract experience level
          if (transcript.includes("junior")) {
            console.log("Detected junior level");
            setInterviewRequirements((prev) => {
              const updated = { ...prev, level: "Junior" };
              console.log("Updated requirements (level):", updated);
              return updated;
            });
          } else if (
            transcript.includes("mid") ||
            transcript.includes("intermediate")
          ) {
            console.log("Detected mid-level");
            setInterviewRequirements((prev) => {
              const updated = { ...prev, level: "Mid-level" };
              console.log("Updated requirements (level):", updated);
              return updated;
            });
          } else if (transcript.includes("senior")) {
            console.log("Detected senior level");
            setInterviewRequirements((prev) => {
              const updated = { ...prev, level: "Senior" };
              console.log("Updated requirements (level):", updated);
              return updated;
            });
          }

          // Set default level if none detected
          if (!interviewRequirements.level) {
            console.log("No level detected, setting default to Mid-level");
            setInterviewRequirements((prev) => {
              const updated = { ...prev, level: "Mid-level" };
              console.log("Updated requirements (default level):", updated);
              return updated;
            });
          }

          // Extract number of questions
          if (
            transcript.includes("5 question") ||
            transcript.includes("five question")
          ) {
            setInterviewRequirements((prev) => ({ ...prev, amount: "5" }));
          } else if (
            transcript.includes("7 question") ||
            transcript.includes("seven question")
          ) {
            setInterviewRequirements((prev) => ({ ...prev, amount: "7" }));
          } else if (
            transcript.includes("10 question") ||
            transcript.includes("ten question")
          ) {
            setInterviewRequirements((prev) => ({ ...prev, amount: "10" }));
          }

          // Extract role and tech stack (more complex)
          // Look for common role keywords
          const roleKeywords = [
            { keyword: "frontend", value: "Front-End Developer" },
            { keyword: "backend", value: "Back-End Developer" },
            { keyword: "full stack", value: "Full-Stack Developer" },
            { keyword: "data scientist", value: "Data Scientist" },
            { keyword: "machine learning", value: "Machine Learning Engineer" },
            { keyword: "devops", value: "DevOps Engineer" },
            { keyword: "ui", value: "UI Designer" },
            { keyword: "ux", value: "UX Designer" },
            { keyword: "product manager", value: "Product Manager" },
            { keyword: "qa", value: "QA Specialist" },
            { keyword: "security", value: "Security Specialist" },
            { keyword: "mobile", value: "Mobile Developer" },
            { keyword: "software", value: "Software Developer" },
            { keyword: "web", value: "Web Developer" },
            { keyword: "developer", value: "Software Developer" },
            { keyword: "engineer", value: "Software Engineer" },
          ];

          console.log("Searching for role keywords in:", transcript);
          let roleDetected = false;

          for (const { keyword, value } of roleKeywords) {
            if (transcript.includes(keyword)) {
              console.log(`Detected role keyword: "${keyword}" -> "${value}"`);
              setInterviewRequirements((prev) => {
                const updated = { ...prev, role: value };
                console.log("Updated requirements (role):", updated);
                roleDetected = true;
                return updated;
              });
              break;
            }
          }

          // Set default role if none detected
          if (!roleDetected && !interviewRequirements.role) {
            console.log(
              "No role detected, setting default to Software Developer"
            );
            setInterviewRequirements((prev) => {
              const updated = { ...prev, role: "Software Developer" };
              console.log("Updated requirements (default role):", updated);
              return updated;
            });
          }

          // Extract tech stack
          const techKeywords = [
            { keyword: "javascript", value: "JavaScript" },
            { keyword: "react", value: "React" },
            { keyword: "angular", value: "Angular" },
            { keyword: "vue", value: "Vue.js" },
            { keyword: "node", value: "Node.js" },
            { keyword: "python", value: "Python" },
            { keyword: "django", value: "Django" },
            { keyword: "flask", value: "Flask" },
            { keyword: "java", value: "Java" },
            { keyword: "spring", value: "Spring Boot" },
            { keyword: "c#", value: "C#" },
            { keyword: ".net", value: ".NET" },
            { keyword: "php", value: "PHP" },
            { keyword: "laravel", value: "Laravel" },
            { keyword: "ruby", value: "Ruby" },
            { keyword: "rails", value: "Ruby on Rails" },
            { keyword: "sql", value: "SQL" },
            { keyword: "nosql", value: "NoSQL" },
            { keyword: "mongodb", value: "MongoDB" },
            { keyword: "postgresql", value: "PostgreSQL" },
            { keyword: "mysql", value: "MySQL" },
            { keyword: "aws", value: "AWS" },
            { keyword: "azure", value: "Azure" },
            { keyword: "gcp", value: "Google Cloud" },
            { keyword: "docker", value: "Docker" },
            { keyword: "kubernetes", value: "Kubernetes" },
            { keyword: "typescript", value: "TypeScript" },
            { keyword: "html", value: "HTML" },
            { keyword: "css", value: "CSS" },
            { keyword: "web", value: "Web Development" },
          ];

          console.log("Searching for tech stack keywords in:", transcript);
          const detectedTech: string[] = [];
          for (const { keyword, value } of techKeywords) {
            if (transcript.includes(keyword)) {
              console.log(`Detected tech keyword: "${keyword}" -> "${value}"`);
              detectedTech.push(value);
            }
          }

          if (detectedTech.length > 0) {
            console.log("Detected tech stack:", detectedTech);
            setInterviewRequirements((prev) => {
              const updated = { ...prev, techstack: detectedTech.join(", ") };
              console.log("Updated requirements (tech stack):", updated);
              return updated;
            });
          } else {
            // Set default tech stack if none detected
            console.log("No tech stack detected, setting default");
            setInterviewRequirements((prev) => {
              const updated = {
                ...prev,
                techstack: "JavaScript, React, Node.js",
              };
              console.log(
                "Updated requirements (default tech stack):",
                updated
              );
              return updated;
            });
          }
        }
      }
    };

    const onSpeechStart = () => {
      console.log("speech start");
      setIsSpeaking(true);
    };

    const onSpeechEnd = () => {
      console.log("speech end");
      setIsSpeaking(false);
    };

    const onError = (error: Error) => {
      console.log("Error:", error);
      // Handle WebSocket errors
      if (error && typeof error === "object" && "message" in error) {
        if (String(error.message).includes("Meeting ended")) {
          console.log(
            "WebSocket connection error detected, resetting call status"
          );
          setCallStatus(CallStatus.INACTIVE);

          // Set call as finished to trigger the useEffect that handles interview generation
          setCallStatus(CallStatus.FINISHED);
        }
      }
    };

    // Add global error handler for unhandled WebSocket errors
    const handleGlobalError = (event: ErrorEvent) => {
      if (
        event.error &&
        event.error.message &&
        event.error.message.includes("Meeting ended")
      ) {
        console.log("Handling global WebSocket error");
        event.preventDefault();
        setCallStatus(CallStatus.INACTIVE);

        // Set call as finished to trigger the useEffect that handles interview generation
        setCallStatus(CallStatus.FINISHED);
      }
    };

    window.addEventListener("error", handleGlobalError);

    vapi.on("call-start", onCallStart);
    vapi.on("call-end", onCallEnd);
    vapi.on("message", onMessage);
    vapi.on("speech-start", onSpeechStart);
    vapi.on("speech-end", onSpeechEnd);
    vapi.on("error", onError);

    return () => {
      window.removeEventListener("error", handleGlobalError);
      vapi.off("call-start", onCallStart);
      vapi.off("call-end", onCallEnd);
      vapi.off("message", onMessage);
      vapi.off("speech-start", onSpeechStart);
      vapi.off("speech-end", onSpeechEnd);
      vapi.off("error", onError);
    };
  }, [type, router]);

  useEffect(() => {
    if (messages.length > 0) {
      setLastMessage(messages[messages.length - 1].content);
    }

    const handleGenerateFeedback = async (messages: SavedMessage[]) => {
      console.log("handleGenerateFeedback");

      const { success, feedbackId: id } = await createFeedback({
        interviewId: interviewId!,
        userId: userId!,
        transcript: messages,
        feedbackId,
      });

      if (success && id) {
        router.push(`/interview/${interviewId}/feedback`);
      } else {
        console.log("Error saving feedback");
        router.push("/");
      }
    };

    // Function to generate interview after voice interaction
    const generateInterview = async () => {
      console.log("generateInterview function called");
      try {
        console.log(
          "Generating interview with requirements:",
          interviewRequirements
        );

        // Use collected requirements or defaults
        const reqType = interviewRequirements.type || "Technical";
        const reqRole = interviewRequirements.role || "Software Developer";
        const reqLevel = interviewRequirements.level || "Mid-level";
        const reqTechstack =
          interviewRequirements.techstack || "JavaScript, React, Node.js";
        const reqAmount = interviewRequirements.amount || "5";

        console.log("Final interview parameters:", {
          type: reqType,
          role: reqRole,
          level: reqLevel,
          techstack: reqTechstack,
          amount: reqAmount,
          userid: userId,
        });

        if (!userId) {
          console.error("User ID is missing, cannot generate interview");
          alert("Error: User ID is missing. Please sign in again.");
          router.push("/sign-in");
          return;
        }

        console.log("Making API call to generate interview...");
        const response = await fetch("/api/vapi/generate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: reqType,
            role: reqRole,
            level: reqLevel,
            techstack: reqTechstack,
            amount: reqAmount,
            userid: userId,
          }),
        });

        console.log("API response received");
        const data = await response.json();
        console.log("Interview generation response:", data);

        if (!data.success) {
          throw new Error(data.error || "Failed to generate interview");
        }

        console.log(
          "Interview generated successfully, redirecting to home page"
        );
        // Redirect to home page after successful generation
        router.push("/");
      } catch (error) {
        console.error("Error generating interview:", error);
        alert("Error generating the interview. Please try again.");
        router.push("/");
      }
    };

    if (callStatus === CallStatus.FINISHED) {
      console.log("Call status is FINISHED");
      console.log("Type:", type);
      console.log("User ID:", userId);
      console.log("Interview requirements:", interviewRequirements);

      if (type === "generate") {
        console.log("This is a generate interview call");
        // Check if we have enough requirements to generate an interview
        if (
          userId &&
          interviewRequirements.role &&
          interviewRequirements.level &&
          interviewRequirements.techstack
        ) {
          console.log("We have enough requirements, generating interview");
          generateInterview();
        } else {
          console.log(
            "Not enough requirements from voice interaction, redirecting to home"
          );
          // If we don't have enough requirements, just redirect to home
          router.push("/");
        }
      } else {
        console.log("This is a regular interview, generating feedback");
        handleGenerateFeedback(messages);
      }
    }
  }, [
    messages,
    callStatus,
    feedbackId,
    interviewId,
    router,
    type,
    userId,
    interviewRequirements,
  ]);

  const handleCall = async () => {
    try {
      setCallStatus(CallStatus.CONNECTING);

      console.log("Starting call with type:", type);
      console.log("User info:", { userName, userId });

      // We don't need this event listener since we already have one in the useEffect
      // This prevents duplicate handlers

      if (type === "generate") {
        const workflowId = process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID;
        console.log("Using workflow ID:", workflowId);

        if (!workflowId) {
          console.error("NEXT_PUBLIC_VAPI_WORKFLOW_ID is not defined");
          alert(
            "Error: Vapi workflow ID is not configured. Please check your environment variables."
          );
          setCallStatus(CallStatus.INACTIVE);
          return;
        }

        if (!userName || !userId) {
          console.error("userName or userId is not defined");
          alert("Error: User information is missing. Please sign in again.");
          setCallStatus(CallStatus.INACTIVE);
          return;
        }

        // Use a timeout to prevent hanging if the connection fails
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error("Connection timeout")), 15000);
        });

        try {
          console.log("Starting voice agent with workflow ID:", workflowId);

          // Set a flag in localStorage to indicate we're in interview generation mode
          localStorage.setItem("generating_interview", "true");

          // Now start the voice agent
          await Promise.race([
            vapi.start(workflowId, {
              variableValues: {
                username: userName,
                userid: userId,
              },
            }),
            timeoutPromise,
          ]);
        } catch (err: any) {
          console.error("Error in Vapi connection or API call:", err);

          if (err && err.message === "Connection timeout") {
            console.log("Connection timed out, returning to home page");
            alert("Connection timed out. Please try again later.");
            router.push("/");
            return;
          }

          // For other errors, throw to be caught by the outer catch
          throw err;
        }
      } else {
        let formattedQuestions = "";
        if (questions) {
          formattedQuestions = questions
            .map((question) => `- ${question}`)
            .join("\n");
        }

        // Use a timeout to prevent hanging if the connection fails
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error("Connection timeout")), 15000);
        });

        try {
          await Promise.race([
            vapi.start(interviewer, {
              variableValues: {
                questions: formattedQuestions,
              },
            }),
            timeoutPromise,
          ]);
        } catch (err: any) {
          console.error("Error in Vapi connection:", err);
          if (err && err.message === "Connection timeout") {
            alert("Connection timed out. Please try again later.");
          }
          throw err;
        }
      }
    } catch (error) {
      console.error("Error starting call:", error);

      // Don't show alert for WebSocket errors
      if (error && typeof error === "object" && "message" in error) {
        if (!String(error.message).includes("Meeting ended")) {
          alert("Error starting the interview. Please try again later.");
        }
      } else {
        alert("Error starting the interview. Please try again later.");
      }

      setCallStatus(CallStatus.INACTIVE);
    }
  };

  const handleDisconnect = () => {
    setCallStatus(CallStatus.FINISHED);
    vapi.stop();
  };

  return (
    <>
      <div className="call-view">
        {/* AI Interviewer Card */}
        <div className="card-interviewer">
          <div className="avatar">
            <Image
              src="/ai-avatar.png"
              alt="profile-image"
              width={65}
              height={54}
              className="object-cover"
            />
            {isSpeaking && <span className="animate-speak" />}
          </div>
          <h3>AI Interviewer</h3>
        </div>

        {/* User Profile Card */}
        <div className="card-border">
          <div className="card-content">
            <Image
              src="/user-avatar.png"
              alt="profile-image"
              width={539}
              height={539}
              className="rounded-full object-cover size-[120px]"
            />
            <h3>{userName}</h3>
          </div>
        </div>
      </div>

      {messages.length > 0 && (
        <div className="transcript-border">
          <div className="transcript">
            <p
              key={lastMessage}
              className={cn(
                "transition-opacity duration-500 opacity-0",
                "animate-fadeIn opacity-100"
              )}
            >
              {lastMessage}
            </p>
          </div>
        </div>
      )}

      <div className="w-full flex justify-center">
        {callStatus !== "ACTIVE" ? (
          <button className="relative btn-call" onClick={() => handleCall()}>
            <span
              className={cn(
                "absolute animate-ping rounded-full opacity-75",
                callStatus !== "CONNECTING" && "hidden"
              )}
            />

            <span className="relative">
              {callStatus === "INACTIVE" || callStatus === "FINISHED"
                ? "Call"
                : ". . ."}
            </span>
          </button>
        ) : (
          <button className="btn-disconnect" onClick={() => handleDisconnect()}>
            End
          </button>
        )}
      </div>
    </>
  );
};

export default Agent;
