"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Code,
  ShieldCheck,
  Workflow,
  BrainCircuit,
  Lightbulb,
  GitPullRequest,
  ChevronRight,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { BenefitModal } from "./BenefitModal";

// Define the Benefit interface
interface Benefit {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
}

export const KeyBenefits: React.FC = () => {
  const [selectedBenefit, setSelectedBenefit] = useState<Benefit | null>(null);

  const benefits: Benefit[] = [
    {
      icon: <BrainCircuit className="w-8 h-8 text-white" />,
      title: "Intelligent Code Generation",
      description:
        "Create production-ready Apex classes and Lightning Web Components based on existing ISC repository patterns",
      gradient: "from-blue-600 to-cyan-500",
    },
    {
      icon: <ShieldCheck className="w-8 h-8 text-white" />,
      title: "Comprehensive Testing",
      description:
        "Generate robust test classes with mocking, stubbing, and edge case detection based on ISC best practices",
      gradient: "from-purple-600 to-pink-500",
    },
    {
      icon: <Workflow className="w-8 h-8 text-white" />,
      title: "Multi-Agent Workflow",
      description:
        "Leverage specialized AI agents powered by IBM Granite 3.2 for query analysis, code retrieval, and generation",
      gradient: "from-green-600 to-emerald-500",
    },
    {
      icon: <GitPullRequest className="w-8 h-8 text-white" />,
      title: "Always Up-to-Date",
      description:
        "Automatically updated knowledge base whenever PRs are merged into ISC repositories",
      gradient: "from-orange-600 to-yellow-500",
    },
    {
      icon: <Lightbulb className="w-8 h-8 text-white" />,
      title: "Context-Aware Recommendations",
      description:
        "Get suggestions that align with your existing architecture and coding patterns through Milvus vector database",
      gradient: "from-red-600 to-rose-500",
    },
    {
      icon: <Code className="w-8 h-8 text-white" />,
      title: "Carbon Design Integration",
      description:
        "Generate Lightning Web Components that follow IBM Carbon design system for consistent enterprise UI",
      gradient: "from-indigo-600 to-purple-500",
    },
  ];

  const handleLearnMore = (benefit: Benefit) => {
    setSelectedBenefit(benefit);
  };

  const closeModal = () => {
    setSelectedBenefit(null);
  };

  return (
    <section className="py-20 relative">
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 blur-3xl" />

      {/* Section header */}
      <div className="text-center mb-16">
        <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-violet-400 to-purple-400 mb-4">
          Key Benefits
        </h2>
        <p className="text-xl text-gray-400 max-w-3xl mx-auto">
          Transform your Salesforce development workflow with powerful
          AI-assisted capabilities
        </p>
      </div>

      {/* Benefits grid */}
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="relative group h-full"
            >
              <div
                className={`absolute inset-0 bg-gradient-to-r ${benefit.gradient} opacity-10 blur-xl rounded-2xl group-hover:opacity-20 transition-opacity duration-300`}
              />

              <Card className="relative backdrop-blur-sm bg-black/40 border-gray-800/50 group-hover:border-gray-700/50 p-8 rounded-2xl overflow-hidden h-full flex flex-col">
                <div className="flex items-center space-x-4 mb-4">
                  <div
                    className={`p-3 rounded-xl bg-gradient-to-r ${benefit.gradient} transform group-hover:scale-110 transition-transform duration-300`}
                  >
                    {benefit.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-200">
                    {benefit.title}
                  </h3>
                </div>

                <p className="text-gray-400 mt-auto">{benefit.description}</p>

                <div className="mt-4 pt-4 border-t border-gray-800">
                  <button
                    onClick={() => handleLearnMore(benefit)}
                    className={`text-sm font-medium bg-clip-text text-transparent bg-gradient-to-r ${benefit.gradient} flex items-center hover:opacity-80 transition-opacity`}
                  >
                    Learn more
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Modal for showing benefit details */}
      <BenefitModal
        isOpen={!!selectedBenefit}
        onClose={closeModal}
        benefit={selectedBenefit}
      />
    </section>
  );
};

export default KeyBenefits;
