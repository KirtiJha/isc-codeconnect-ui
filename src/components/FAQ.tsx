"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";

const faqs = [
  {
    category: "Usage",
    questions: [
      {
        id: 1,
        question: "How do I get started with ISC-CodeConnect?",
        answer:
          "Simply sign in with your IBM w3Id credentials and start by describing your development needs in natural language. Our AI will guide you through the process of generating Salesforce solutions.",
      },
      {
        id: 2,
        question:
          "What types of Salesforce development can ISC-CodeConnect help with?",
        answer:
          "We support a wide range of development tasks including Apex classes, triggers, Lightning Web Components, automated testing, and more. Our AI can help with both new development and optimization of existing code.",
      },
      {
        id: 3,
        question: "How accurate is the generated code?",
        answer:
          "Our AI generates production-ready code following Salesforce best practices and patterns. All code includes proper error handling and is optimized for bulk operations. We recommend reviewing the generated code before deployment.",
      },
    ],
  },
  {
    category: "Technical Requirements",
    questions: [
      {
        id: 4,
        question: "What are the system requirements?",
        answer:
          "ISC-CodeConnect is a web-based solution that works with any modern browser. No local installation is required. You only need your IBM w3Id credentials and appropriate Salesforce org access.",
      },
      {
        id: 5,
        question: "Does it work with all Salesforce editions?",
        answer:
          "Yes, ISC-CodeConnect is compatible with all Salesforce editions. However, some features may depend on your org's specific licenses and capabilities.",
      },
    ],
  },
  {
    category: "Access Management",
    questions: [
      {
        id: 6,
        question: "How is access controlled?",
        answer:
          "Access is managed through IBM w3Id authentication. Your permissions are automatically aligned with your organizational role and Salesforce access levels.",
      },
      {
        id: 7,
        question: "Can I share generated code with my team?",
        answer:
          "Yes, all generated code can be shared with team members who have appropriate access. We also provide collaboration features for code review and version control.",
      },
    ],
  },
  {
    category: "Best Practices",
    questions: [
      {
        id: 8,
        question: "What are the recommended ways to use ISC-CodeConnect?",
        answer:
          "We recommend starting with clear requirements, reviewing generated code thoroughly, and following iterative development practices. Use our documentation for guidance on best practices specific to your use case.",
      },
      {
        id: 9,
        question: "How should I handle complex requirements?",
        answer:
          "Break down complex requirements into smaller, manageable pieces. Our AI can handle multiple related requests and help you combine them into a cohesive solution.",
      },
    ],
  },
];

interface FAQItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}

const FAQItem = ({ question, answer, isOpen, onToggle }: FAQItemProps) => {
  return (
    <div className="border-b border-gray-800">
      <button
        className="w-full py-6 flex justify-between items-center focus:outline-none group"
        onClick={onToggle}
      >
        <span className="text-left text-lg font-medium text-gray-200 group-hover:text-white">
          {question}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0 ml-4"
        >
          <Plus className="w-5 h-5 text-gray-400 group-hover:text-white" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="pb-6 text-gray-400 leading-relaxed">{answer}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface CategorySectionProps {
  category: string;
  questions: Array<{
    id: number;
    question: string;
    answer: string;
  }>;
}

const CategorySection = ({ category, questions }: CategorySectionProps) => {
  const [openId, setOpenId] = useState<number | null>(null);

  return (
    <div className="mb-12">
      <h3 className="text-2xl font-semibold text-white mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
        {category}
      </h3>
      <div className="space-y-2">
        {questions.map((item) => (
          <FAQItem
            key={item.id}
            question={item.question}
            answer={item.answer}
            isOpen={openId === item.id}
            onToggle={() => setOpenId(openId === item.id ? null : item.id)}
          />
        ))}
      </div>
    </div>
  );
};

export const FAQ = () => {
  return (
    <section className="py-20 relative">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-900/10 to-transparent" />

      <div className="container mx-auto px-4 relative">
        <div className="max-w-3xl mx-auto">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-gray-400 text-lg">
              Everything you need to know about ISC-CodeConnect
            </p>
          </motion.div>

          {/* FAQ Categories */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {faqs.map((category) => (
              <CategorySection
                key={category.category}
                category={category.category}
                questions={category.questions}
              />
            ))}
          </motion.div>

          {/* Support Link */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-16 text-center"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 blur-md rounded-xl"></div>
              <div className="relative bg-black/30 backdrop-blur-sm rounded-xl border border-gray-800/50 p-6">
                <h3 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 mb-3">
                  Still have questions?
                </h3>
                <p className="text-gray-400 mb-5">
                  We are here to help. Reach out to our support team for
                  assistance.
                </p>
                <a
                  href="https://ibm.enterprise.slack.com/archives/C08A7F16P7E"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-5 py-2 rounded-lg hover:shadow-blue-500/20 hover:shadow-lg transition-all duration-300"
                >
                  <span>Contact Support</span>
                  <svg
                    viewBox="0 0 24 24"
                    width="18"
                    height="18"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M14.5 10c-.83 0-1.5-.67-1.5-1.5v-5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5v5c0 .83-.67 1.5-1.5 1.5z"></path>
                    <path d="M20.5 10H19V8.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"></path>
                    <path d="M9.5 14c.83 0 1.5.67 1.5 1.5v5c0 .83-.67 1.5-1.5 1.5S8 21.33 8 20.5v-5c0-.83.67-1.5 1.5-1.5z"></path>
                    <path d="M3.5 14H5v1.5c0 .83-.67 1.5-1.5 1.5S2 16.33 2 15.5 2.67 14 3.5 14z"></path>
                    <path d="M14 14.5c0-.83.67-1.5 1.5-1.5h5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-5c-.83 0-1.5-.67-1.5-1.5z"></path>
                    <path d="M15.5 19H14v1.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5-.67-1.5-1.5-1.5z"></path>
                    <path d="M10 9.5C10 8.67 9.33 8 8.5 8h-5C2.67 8 2 8.67 2 9.5S2.67 11 3.5 11h5c.83 0 1.5-.67 1.5-1.5z"></path>
                    <path d="M8.5 5H10V3.5C10 2.67 9.33 2 8.5 2S7 2.67 7 3.5 7.67 5 8.5 5z"></path>
                  </svg>
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
