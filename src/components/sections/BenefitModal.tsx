"use client";
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

// Define the Benefit interface
interface Benefit {
  title: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
}

// Define the BenefitDetails interface
interface BenefitDetails {
  keyPoints: string[];
  example: string;
}

// Define props for the BenefitModal component
interface BenefitModalProps {
  isOpen: boolean;
  onClose: () => void;
  benefit: Benefit | null;
}

export function BenefitModal({ isOpen, onClose, benefit }: BenefitModalProps) {
  if (!benefit) return null;

  // Map of additional details for each benefit type
  const benefitDetails: Record<string, BenefitDetails> = {
    "Intelligent Code Generation": {
      keyPoints: [
        "Repository-aware code suggestions based on ISC patterns",
        "Contextual understanding of existing architecture",
        "Best practices automatically applied to generated code",
        "Support for both Apex and Lightning Web Components",
      ],
      example:
        "Ask for a new AccountService class and get production-ready code that follows ISC patterns, including error handling, security model compliance, and proper SOQL optimization.",
    },
    "Comprehensive Testing": {
      keyPoints: [
        "Automated test class generation with high coverage",
        "Mock objects and stubs for external dependencies",
        "Edge case detection and handling",
        "Bulk data testing scenarios included",
      ],
      example:
        "Generate test classes for your Apex code with mocks for API callouts, simulated database records, and comprehensive assertions for both success and failure scenarios.",
    },
    "Multi-Agent Workflow": {
      keyPoints: [
        "Specialized agents for query analysis, retrieval, and code generation",
        "IBM Granite 3.2 reasoning model integration",
        "Collaborative agent system for comprehensive solutions",
        "Intelligent task routing for optimal results",
      ],
      example:
        "Your request is analyzed by a specialized agent that determines intent, then a retrieval agent finds relevant patterns, followed by a generation agent that creates your solution.",
    },
    "Always Up-to-Date": {
      keyPoints: [
        "Automatic PR merge detection across ISC repositories",
        "Delta processing for changed files only",
        "Real-time knowledge base updates",
        "Historical version awareness",
      ],
      example:
        "When a team member merges a PR with new patterns or components, the system automatically detects the changes and updates its knowledge base within minutes.",
    },
    "Context-Aware Recommendations": {
      keyPoints: [
        "Milvus vector database for efficient pattern matching",
        "Intelligent code chunking for semantic understanding",
        "Cross-repository pattern detection",
        "Relevance ranking based on your specific codebase",
      ],
      example:
        "Get recommendations that understand the relationships between your classes, respecting existing naming conventions and architectural patterns used across your repositories.",
    },
    "Carbon Design Integration": {
      keyPoints: [
        "IBM Carbon design system components for Salesforce",
        "Accessibility compliance built-in (WCAG 2.1 AA)",
        "Responsive layouts for all device sizes",
        "Consistent enterprise user experience",
      ],
      example:
        "Generate LWC components that leverage Carbon design patterns, ensuring your Salesforce UI is consistent with other IBM enterprise applications.",
    },
  };

  const details = benefitDetails[benefit.title] || {
    keyPoints: ["Feature details not available"],
    example: "Example not available",
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-gray-900/90 border-gray-700">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div
              className={`p-3 rounded-xl bg-gradient-to-r ${benefit.gradient}`}
            >
              {benefit.icon}
            </div>
            <DialogTitle className="text-2xl text-white">
              {benefit.title}
            </DialogTitle>
          </div>
          <DialogDescription className="text-gray-300 text-base">
            {benefit.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 my-2">
          <div>
            <h4 className="text-white font-medium mb-3">Key Features</h4>
            <div className="space-y-2">
              {details.keyPoints.map((point, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <CheckCircle className="text-green-500 h-5 w-5 mt-0.5" />
                  <p className="text-gray-300">{point}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-white font-medium mb-2">Example Usage</h4>
            <div className="bg-black/50 p-4 rounded-lg border border-gray-800">
              <p className="text-gray-300">{details.example}</p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={onClose}
            className={`bg-gradient-to-r ${benefit.gradient} hover:opacity-90 transition-opacity`}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
