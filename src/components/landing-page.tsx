"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, FileText } from "lucide-react";
import { signInW3id, signOutFormAction } from "@/app/(auth)/actions";
import { Session } from "next-auth";

// Import existing components
import { HeroIllustration } from "@/components/hero";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { KeyBenefits } from "@/components/sections/KeyBenefits";
import { Navbar } from "@/components/Navbar";
import { FAQ } from "@/components/FAQ";
import ArchitectureDiagram from "@/components/ArchitectureDiagram";

const SignIn: React.FC = () => {
  return (
    <form action={signInW3id}>
      <motion.button
        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg shadow-lg hover:shadow-blue-500/25 transition-all duration-300"
        type="submit"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Sign in with IBM Github
      </motion.button>
    </form>
  );
};

function SignOut(): React.JSX.Element {
  return (
    <form action={signOutFormAction}>
      <motion.button
        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg shadow-lg hover:shadow-blue-500/25 transition-all duration-300"
        type="submit"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Sign out
      </motion.button>
    </form>
  );
}

interface TypewriterTextProps {
  phrases: string[];
  interval?: number;
}

const TypewriterText: React.FC<TypewriterTextProps> = ({ phrases }) => {
  const [currentPhrase, setCurrentPhrase] = useState(0);
  const [text, setText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const typeText = () => {
      const current = phrases[currentPhrase];
      if (!isDeleting) {
        if (text.length < current.length) {
          timeout = setTimeout(() => {
            setText(current.substring(0, text.length + 1));
          }, 50);
        } else {
          timeout = setTimeout(() => setIsDeleting(true), 2000);
        }
      } else {
        if (text.length > 0) {
          timeout = setTimeout(() => {
            setText(current.substring(0, text.length - 1));
          }, 30);
        } else {
          setIsDeleting(false);
          setCurrentPhrase((prev) => (prev + 1) % phrases.length);
        }
      }
    };

    typeText();
    return () => clearTimeout(timeout);
  }, [text, isDeleting, currentPhrase, phrases]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full px-4 py-6"
    >
      <div className="relative">
        {/* Background glow effect */}
        <div className="absolute -inset-2 bg-gradient-to-r from-blue-600/20 via-violet-600/20 to-purple-600/20 blur-xl rounded-lg" />

        {/* Text container */}
        <div className="relative p-2">
          <span className="text-3xl md:text-4xl font-bold inline-block w-full text-center">
            {/* Gradient background for text */}
            <span className="bg-gradient-to-r from-blue-400 via-violet-400 to-purple-400 text-transparent bg-clip-text">
              {text}
            </span>
            {/* Animated cursor */}
            <span className="animate-pulse ml-1 font-light text-blue-400">
              _
            </span>
          </span>
        </div>
      </div>
    </motion.div>
  );
};

interface LandingPageProps {
  session: Session | null;
}

export default function LandingPage({ session }: LandingPageProps) {
  const [showArchitecture, setShowArchitecture] = useState<boolean>(false);
  const user = session?.user?.email;

  const phrases: string[] = [
    "Crafting Apex",
    "Architecting LWCs",
    "Generating Tests",
    "Analyzing Code",
    "Optimizing Logic",
    "Debugging Solutions",
    "Enhancing Performance",
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar
        session={session}
        showArchitecture={showArchitecture}
        setShowArchitecture={setShowArchitecture}
      />

      <div className="min-h-screen relative overflow-hidden">
        <div className="container mx-auto px-4 pt-20 pb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-5xl mx-auto mt-20"
          >
            {/* Main Title with Icon */}
            <div className="flex flex-col items-center justify-center">
              <motion.div
                className="flex items-center space-x-3 mb-6"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Sparkles className="w-10 h-10 text-blue-400" />
                <h1 className="text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                  ISC-CodeConnect
                </h1>
              </motion.div>

              {/* Subtitle - centered */}
              <motion.p
                className="text-lg text-gray-300 text-center max-w-xl mb-10"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
              >
                AI-powered assistant for Salesforce developers. Enhance
                productivity with code generation, completion and learning
                tools.
              </motion.p>
            </div>

            {/* Add Typewriter Animation in a container */}
            <div className="relative mb-16 w-full max-w-4xl mx-auto">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-violet-500/10 blur-xl rounded-3xl" />

              <div className="backdrop-blur-md bg-black/30 rounded-xl border border-gray-800/50 shadow-2xl">
                <TypewriterText phrases={phrases} />
              </div>
            </div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap items-center justify-center gap-6 mb-16"
            >
              <div className="mt-4">{user ? <SignOut /> : <SignIn />}</div>

              {/* Release Notes Button */}
              <motion.a
                href="https://ibm.box.com/s/ivfg601ndtbelr05388hzcy9wlds8pze"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-6 py-3 rounded-lg shadow-lg hover:shadow-blue-500/25 transition-all duration-300 mt-4"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FileText className="w-5 h-5" />
                Release Notes
              </motion.a>
            </motion.div>

            {/* Architecture Modal */}
            <AnimatePresence>
              {showArchitecture && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 overflow-hidden bg-black/80 backdrop-blur-sm"
                >
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="fixed inset-0 z-50 overflow-auto"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ArchitectureDiagram
                      onClose={() => setShowArchitecture(false)}
                    />
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mb-20">
              <HeroIllustration />
            </div>
          </motion.div>

          {/* Include the proper sections with consistent spacing */}
          <div className="mt-20 mb-20">
            <HowItWorks />
          </div>

          <div className="mt-20 mb-20">
            <KeyBenefits />
          </div>

          <div className="mt-20 mb-20">
            <FAQ />
          </div>
        </div>
      </div>
    </div>
  );
}
