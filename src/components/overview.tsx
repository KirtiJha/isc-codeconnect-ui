import { motion } from "framer-motion";
import {
  MessageCircle,
  Sparkles,
  Code,
  FileCheck,
  Zap,
  Wrench,
  TrendingUp,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export const Overview = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [greeting, setGreeting] = useState("Hello");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.refresh();
    }

    // Set greeting based on time of day
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 18) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");
  }, [router, session, status]);

  const features = [
    {
      icon: <Code className="w-5 h-5 text-blue-400" />,
      text: "Apex code analysis and development",
      gradient: "from-blue-600 to-cyan-500",
    },
    {
      icon: <FileCheck className="w-5 h-5 text-green-400" />,
      text: "Apex test case review and creation",
      gradient: "from-green-600 to-emerald-500",
    },
    {
      icon: <Zap className="w-5 h-5 text-yellow-400" />,
      text: "LWC component development",
      gradient: "from-orange-500 to-yellow-500",
    },
    {
      icon: <Wrench className="w-5 h-5 text-purple-400" />,
      text: "LWC Jest test implementation",
      gradient: "from-purple-600 to-pink-500",
    },
    {
      icon: <TrendingUp className="w-5 h-5 text-indigo-400" />,
      text: "Code improvement suggestions",
      gradient: "from-indigo-600 to-blue-500",
    },
  ];

  return (
    <motion.div
      key="overview"
      className="max-w-4xl mx-auto mt-10 md:mt-16"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.4 }}
    >
      <div className="relative">
        {/* Background glow */}
        <div className="absolute -inset-10 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-indigo-600/10 blur-3xl rounded-full" />

        <div className="relative rounded-2xl backdrop-blur-sm bg-black/30 border border-gray-800/50 p-8 flex flex-col gap-6 leading-relaxed text-center">
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="relative">
              <div className="absolute -inset-6 bg-blue-500/20 blur-lg rounded-full animate-pulse" />
              <Sparkles className="relative w-16 h-16 text-blue-400" />
            </div>
            <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-violet-400 to-purple-500">
              ISC-CodeConnect
            </h1>
            <p className="text-lg text-gray-400 max-w-2xl">
              Your AI-powered Salesforce Development Assistant
            </p>
          </div>

          <motion.div
            className="flex flex-col p-6 rounded-xl border border-gray-800/50 backdrop-blur-sm bg-black/20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <div className="flex items-center space-x-3 mb-4">
              <MessageCircle className="w-7 h-7 text-green-400" />
              <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-100 to-gray-300">
                {greeting}, {session?.user?.name?.split(" ")[0]}!
              </h3>
            </div>

            <p className="text-gray-300 text-lg mb-5">
              I&apos;m your Salesforce code assistant, powered by the latest IBM
              Granite 3.2 model. Here&apos;s how I can help you:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  className="flex items-start space-x-3 group"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1, duration: 0.4 }}
                >
                  <div
                    className={`p-2 rounded-lg bg-gradient-to-r ${feature.gradient} flex-shrink-0`}
                  >
                    {feature.icon}
                  </div>
                  <div className="text-left">
                    <p className="text-gray-200 font-medium">{feature.text}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="relative mt-2">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 blur-md rounded-lg" />
              <p className="relative p-3 text-lg font-medium text-white">
                How can I assist with your Salesforce development today?
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default Overview;
