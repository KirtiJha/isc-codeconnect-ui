"use client";
import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { chatData, feedbackList, feedbackMetrics } from "@/data/dummyData";
import { Navbar } from "@/components/Navbar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  MessageSquare,
  ThumbsUp,
  Search,
  User,
  Hash,
  Star,
  Download,
  Share2,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  BarChart2,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronDown, ChevronUp, Clock } from "lucide-react";

// Define types for chat and feedback data
interface Message {
  type: string;
  content: string;
  timestamp: string;
}

interface Chat {
  id: string;
  userId: string;
  threadId: string;
  lastMessage: string;
  messagesCount: number;
  rating: number;
  feedback: string;
  timestamp: string;
  messages: Message[];
}

interface Feedback {
  id: number;
  userId: string;
  threadId: string;
  rating: number;
  feedback: string;
  timestamp: string;
  query: string;
  response: string;
  category: string;
  resolved: boolean;
}

const getRatingColor = (rating: number): string => {
  if (rating >= 9) return "bg-green-500";
  if (rating >= 7) return "bg-lime-500";
  if (rating >= 5) return "bg-yellow-500";
  if (rating >= 3) return "bg-orange-500";
  return "bg-red-500";
};

interface ChatDetailsModalProps {
  chat: Chat;
  onClose: () => void;
}

const ChatDetailsModal = ({ chat, onClose }: ChatDetailsModalProps) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
    onClick={onClose}
  >
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.95, opacity: 0 }}
      className="fixed inset-10 bg-gray-900 rounded-xl overflow-hidden"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Modal Header */}
      <div className="p-6 border-b border-gray-800 flex items-center justify-between bg-gray-900/50">
        <div className="flex items-center gap-4">
          <User className="w-5 h-5 text-gray-400" />
          <h3 className="text-xl font-semibold">{chat.userId}</h3>
          <div className="flex items-center gap-2 text-gray-400">
            <Hash className="w-4 h-4" />
            <span className="text-sm">{chat.threadId}</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-500" />
            <span className={`font-medium ${getRatingColor(chat.rating)}`}>
              {chat.rating}/10
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ×
          </button>
        </div>
      </div>

      {/* Modal Content */}
      <div className="p-6 space-y-4 max-h-[calc(100vh-12rem)] overflow-y-auto">
        {chat.messages.map((message: Message, index: number) => (
          <div
            key={index}
            className={`p-4 rounded-lg ${
              message.type === "query" ? "bg-gray-800/50" : "bg-gray-800/30"
            }`}
          >
            <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
              <span className="font-medium">
                {message.type === "query" ? "User Query" : "Assistant Response"}
              </span>
              <span>{new Date(message.timestamp).toLocaleTimeString()}</span>
            </div>
            <div className="text-gray-300 whitespace-pre-wrap">
              {message.content}
            </div>
          </div>
        ))}
      </div>

      {/* Modal Footer */}
      <div className="p-6 border-t border-gray-800 bg-gray-900/50">
        {chat.feedback && (
          <div className="flex items-center gap-2 text-gray-400">
            <MessageSquare className="w-4 h-4" />
            <span>Feedback: {chat.feedback}</span>
          </div>
        )}
      </div>
    </motion.div>
  </motion.div>
);

const ChatMonitoring = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [sortConfig, setSortConfig] = useState({
    key: "timestamp",
    direction: "desc",
  });
  const [ratingFilter, setRatingFilter] = useState("all");
  const [timeFilter, setTimeFilter] = useState("24h");

  const filteredData = useMemo(() => {
    let filtered = [...chatData] as Chat[];

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (chat) =>
          chat.userId.toLowerCase().includes(searchLower) ||
          chat.lastMessage.toLowerCase().includes(searchLower) ||
          chat.threadId.toLowerCase().includes(searchLower)
      );
    }

    // Apply rating filter
    if (ratingFilter !== "all") {
      filtered = filtered.filter((chat) => {
        switch (ratingFilter) {
          case "high":
            return chat.rating >= 8;
          case "medium":
            return chat.rating >= 5 && chat.rating < 8;
          case "low":
            return chat.rating < 5;
          default:
            return true;
        }
      });
    }

    // Apply time filter
    const now = new Date();
    filtered = filtered.filter((chat) => {
      const chatDate = new Date(chat.timestamp);
      const hoursDiff = (now.getTime() - chatDate.getTime()) / (1000 * 60 * 60);
      switch (timeFilter) {
        case "24h":
          return hoursDiff <= 24;
        case "7d":
          return hoursDiff <= 168;
        case "30d":
          return hoursDiff <= 720;
        default:
          return true;
      }
    });

    // Sort data
    filtered.sort((a, b) => {
      let comparison = 0;
      if (sortConfig.key === "timestamp") {
        comparison =
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      } else if (sortConfig.key === "rating") {
        comparison = b.rating - a.rating;
      }
      return sortConfig.direction === "desc" ? comparison : -comparison;
    });

    return filtered;
  }, [searchTerm, ratingFilter, timeFilter, sortConfig]);

  const handleSort = (key: string) => {
    setSortConfig((current) => ({
      key,
      direction:
        current.key === key && current.direction === "asc" ? "desc" : "asc",
    }));
  };

  interface SortIconProps {
    column: string;
  }

  const SortIcon = ({ column }: SortIconProps) => {
    if (sortConfig.key !== column) return null;
    return sortConfig.direction === "asc" ? (
      <ChevronUp className="w-4 h-4" />
    ) : (
      <ChevronDown className="w-4 h-4" />
    );
  };

  return (
    <div className="space-y-6">
      {/* Filters Section */}
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search conversations..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={ratingFilter} onValueChange={setRatingFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by Rating" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Ratings</SelectItem>
            <SelectItem value="high">High (8-10)</SelectItem>
            <SelectItem value="medium">Medium (5-7)</SelectItem>
            <SelectItem value="low">Low (1-4)</SelectItem>
          </SelectContent>
        </Select>
        <Select value={timeFilter} onValueChange={setTimeFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Time Period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="24h">Last 24 Hours</SelectItem>
            <SelectItem value="7d">Last 7 Days</SelectItem>
            <SelectItem value="30d">Last 30 Days</SelectItem>
            <SelectItem value="all">All Time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-400">
        Showing {filteredData.length} results
      </div>

      {/* Table */}
      <div className="rounded-lg border border-gray-800 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead
                className="cursor-pointer hover:text-white transition-colors"
                onClick={() => handleSort("timestamp")}
              >
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Timestamp
                  <SortIcon column="timestamp" />
                </div>
              </TableHead>
              <TableHead>User</TableHead>
              <TableHead>Last Message</TableHead>
              <TableHead className="text-center">Messages</TableHead>
              <TableHead
                className="cursor-pointer hover:text-white transition-colors"
                onClick={() => handleSort("rating")}
              >
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  Rating
                  <SortIcon column="rating" />
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.map((chat) => (
              <TableRow
                key={chat.id}
                className="cursor-pointer hover:bg-gray-800/50 transition-colors"
                onClick={() => setSelectedChat(chat)}
              >
                <TableCell className="font-medium">
                  {new Date(chat.timestamp).toLocaleString()}
                </TableCell>
                <TableCell>{chat.userId}</TableCell>
                <TableCell className="max-w-md truncate">
                  {chat.lastMessage}
                </TableCell>
                <TableCell className="text-center">
                  {chat.messagesCount}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-medium ${getRatingColor(chat.rating)}`}
                    >
                      {chat.rating}/10
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Chat Details Modal */}
      <AnimatePresence>
        {selectedChat && (
          <ChatDetailsModal
            chat={selectedChat}
            onClose={() => setSelectedChat(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const FeedbackMonitoring = () => {
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(
    null
  );
  const [timeRange, setTimeRange] = useState("7d");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Filter feedback data based on selected filters
  const filteredFeedback = useMemo(() => {
    let filtered = [...feedbackList] as Feedback[];

    if (categoryFilter !== "all") {
      filtered = filtered.filter(
        (feedback) => feedback.category === categoryFilter
      );
    }

    // Apply time range filter
    const now = new Date();
    filtered = filtered.filter((feedback) => {
      const feedbackDate = new Date(feedback.timestamp);
      const hoursDiff =
        (now.getTime() - feedbackDate.getTime()) / (1000 * 60 * 60);
      switch (timeRange) {
        case "24h":
          return hoursDiff <= 24;
        case "7d":
          return hoursDiff <= 168;
        case "30d":
          return hoursDiff <= 720;
        default:
          return true;
      }
    });

    return filtered;
  }, [categoryFilter, timeRange]);

  // Calculate average rating for the filtered data
  const averageRating = useMemo(() => {
    if (filteredFeedback.length === 0) return 0;
    const sum = filteredFeedback.reduce((acc, curr) => acc + curr.rating, 0);
    return (sum / filteredFeedback.length).toFixed(1);
  }, [filteredFeedback]);

  return (
    <div className="space-y-8">
      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gray-900/50">
          <CardContent className="p-6">
            <div className="space-y-2">
              <div className="text-sm text-gray-400">Average Rating</div>
              <div className="text-3xl font-bold text-green-400">
                {averageRating}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-900/50">
          <CardContent className="p-6">
            <div className="space-y-2">
              <div className="text-sm text-gray-400">Total Feedback</div>
              <div className="text-3xl font-bold text-blue-400">
                {filteredFeedback.length}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-900/50">
          <CardContent className="p-6">
            <div className="space-y-2">
              <div className="text-sm text-gray-400">Response Rate</div>
              <div className="text-3xl font-bold text-purple-400">98%</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Time Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="24h">Last 24 Hours</SelectItem>
            <SelectItem value="7d">Last 7 Days</SelectItem>
            <SelectItem value="30d">Last 30 Days</SelectItem>
            <SelectItem value="all">All Time</SelectItem>
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {feedbackMetrics.categoryBreakdown.map((category) => (
              <SelectItem key={category.category} value={category.category}>
                {category.category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors">
          <Download className="w-4 h-4" />
          <span>Export Metrics</span>
        </button>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Rating Distribution */}
        <Card className="bg-gray-900/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart2 className="w-5 h-5" />
              Rating Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={feedbackMetrics.ratingDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis
                    dataKey="rating"
                    stroke="#9CA3AF"
                    tick={{ fill: "#9CA3AF" }}
                  />
                  <YAxis stroke="#9CA3AF" tick={{ fill: "#9CA3AF" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1F2937",
                      border: "none",
                      borderRadius: "8px",
                      color: "#F3F4F6",
                    }}
                  />
                  <Bar
                    dataKey="count"
                    name="Number of Feedbacks"
                    fill="#3B82F6"
                  >
                    {feedbackMetrics.ratingDistribution.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Rating Trends */}
        <Card className="bg-gray-900/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LineChartIcon className="w-5 h-5" />
              Rating Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={feedbackMetrics.ratingTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis
                    dataKey="date"
                    stroke="#9CA3AF"
                    tick={{ fill: "#9CA3AF" }}
                  />
                  <YAxis
                    domain={[0, 10]}
                    stroke="#9CA3AF"
                    tick={{ fill: "#9CA3AF" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1F2937",
                      border: "none",
                      borderRadius: "8px",
                      color: "#F3F4F6",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="rating"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    dot={{ fill: "#3B82F6", strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card className="bg-gray-900/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="w-5 h-5" />
              Category Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={feedbackMetrics.categoryBreakdown}
                    dataKey="count"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#3B82F6"
                    label={({ value }: { value: number }) => `${value}`}
                    name=""
                  >
                    {feedbackMetrics.categoryBreakdown.map((entry, index) => (
                      <Cell
                        key={index}
                        fill={
                          [
                            "#3B82F6",
                            "#8B5CF6",
                            "#EC4899",
                            "#10B981",
                            "#F59E0B",
                          ][index % 5]
                        }
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1F2937",
                      border: "none",
                      borderRadius: "8px",
                      color: "#F3F4F6",
                    }}
                    formatter={(value, name) => [
                      <span key="category" style={{ color: "#F3F4F6" }}>
                        {name}
                      </span>,
                      <span key="value" style={{ color: "#3B82F6" }}>
                        {value}
                      </span>,
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Time-based Metrics */}
        <Card className="bg-gray-900/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Time-based Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(feedbackMetrics.timeBasedMetrics).map(
                ([period, data]) => (
                  <div
                    key={period}
                    className="flex justify-between items-center p-4 bg-gray-800/50 rounded-lg"
                  >
                    <div className="space-y-1">
                      <div className="text-sm text-gray-400">
                        {period
                          .replace(/([A-Z])/g, " $1")
                          .replace(/^./, (str) => str.toUpperCase())}
                      </div>
                      <div className="font-medium">{data.count} feedbacks</div>
                    </div>
                    <div className="text-lg font-bold text-blue-400">
                      {data.avgRating.toFixed(1)}
                    </div>
                  </div>
                )
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Feedback List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold">Recent Feedback</h3>
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors">
              <Share2 className="w-4 h-4" />
              <span>Share Report</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {filteredFeedback.map((feedback) => (
            <Card
              key={feedback.id}
              className="bg-gray-900/50 hover:bg-gray-900/70 transition-colors cursor-pointer"
              onClick={() => setSelectedFeedback(feedback)}
            >
              <CardContent className="flex items-center justify-between p-6">
                <div className="flex items-center gap-6">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold
                      ${
                        feedback.rating >= 8
                          ? "bg-green-500/20 text-green-400"
                          : feedback.rating >= 6
                            ? "bg-yellow-500/20 text-yellow-400"
                            : "bg-red-500/20 text-red-400"
                      }`}
                  >
                    {feedback.rating}
                  </div>
                  <div>
                    <div className="font-medium flex items-center gap-2">
                      {feedback.userId}
                      <span className="text-sm text-gray-400">
                        {feedback.category}
                      </span>
                    </div>
                    <div className="text-sm text-gray-400 mt-1">
                      {feedback.feedback}
                    </div>
                  </div>
                </div>
                <div className="text-sm text-gray-400">
                  {new Date(feedback.timestamp).toLocaleString()}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Feedback Details Modal */}
      <AnimatePresence>
        {selectedFeedback && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
            onClick={() => setSelectedFeedback(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-gray-900 rounded-xl p-6 max-w-2xl w-full m-4 space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className={`px-3 py-1 rounded-full text-sm font-medium
                      ${
                        selectedFeedback.rating >= 8
                          ? "bg-green-500/20 text-green-400"
                          : selectedFeedback.rating >= 6
                            ? "bg-yellow-500/20 text-yellow-400"
                            : "bg-red-500/20 text-red-400"
                      }`}
                  >
                    Rating: {selectedFeedback.rating}/10
                  </div>
                  <span className="text-gray-400">
                    {new Date(selectedFeedback.timestamp).toLocaleString()}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedFeedback(null)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-400 mb-1">User ID</div>
                  <div className="font-medium">{selectedFeedback.userId}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400 mb-1">Category</div>
                  <div className="font-medium">{selectedFeedback.category}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400 mb-1">Thread ID</div>
                  <div className="font-medium">{selectedFeedback.threadId}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400 mb-1">Query</div>
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    {selectedFeedback.query}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-400 mb-1">Response</div>
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    {selectedFeedback.response}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-400 mb-1">Feedback</div>
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    {selectedFeedback.feedback}
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                  onClick={() => setSelectedFeedback(null)}
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-black">
      <Navbar session={null} />
      <div className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
              Dashboard
            </h2>
          </div>

          <Tabs defaultValue="chat" className="space-y-8">
            <TabsList>
              <TabsTrigger value="chat" className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Chat Monitoring
              </TabsTrigger>
              <TabsTrigger value="feedback" className="flex items-center gap-2">
                <ThumbsUp className="w-4 h-4" />
                Feedback Monitoring
              </TabsTrigger>
            </TabsList>

            <TabsContent value="chat">
              <ChatMonitoring />
            </TabsContent>

            <TabsContent value="feedback">
              <FeedbackMonitoring />
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
