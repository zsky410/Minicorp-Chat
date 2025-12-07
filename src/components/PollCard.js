import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function PollCard({ poll, onVote, currentUserId, canVote = true }) {
  const totalVotes = poll.options.reduce((sum, opt) => sum + (opt.votes?.length || 0), 0);
  const userVotedOption = poll.options.find((opt) => opt.votes?.includes(currentUserId));

  const handleOptionPress = (optionId) => {
    if (!canVote) {
      return; // Director không thể vote
    }
    if (!userVotedOption) {
      onVote?.(poll.id, optionId);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="stats-chart" size={20} color="#007AFF" />
        <Text style={styles.question}>{poll.question}</Text>
      </View>

      <View style={styles.options}>
        {poll.options.map((option) => {
          const votes = option.votes?.length || 0;
          const percentage = totalVotes > 0 ? (votes / totalVotes) * 100 : 0;
          const isVoted = option.votes?.includes(currentUserId);
          const isSelected = userVotedOption?.id === option.id;

          return (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.option,
                isSelected && styles.optionSelected,
                (userVotedOption || !canVote) && styles.optionDisabled,
              ]}
              onPress={() => handleOptionPress(option.id)}
              disabled={!!userVotedOption || !canVote}
            >
              <View style={styles.optionContent}>
                <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                  {option.text}
                </Text>
                {isVoted && (
                  <Ionicons name="checkmark-circle" size={18} color="#4CD964" />
                )}
              </View>
              {userVotedOption && (
                <View style={styles.progressContainer}>
                  <View style={[styles.progressBar, { width: `${percentage}%` }]} />
                  <Text style={styles.percentage}>{Math.round(percentage)}%</Text>
                </View>
              )}
              {userVotedOption && (
                <Text style={styles.voteCount}>{votes} phiếu</Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={styles.footer}>
        {totalVotes} {totalVotes === 1 ? "phiếu" : "phiếu"} • Tạo bởi {poll.createdByName}
        {!canVote && " • Chỉ xem"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    padding: 15,
    marginVertical: 8,
    marginHorizontal: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  question: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
    flex: 1,
  },
  options: {
    gap: 10,
  },
  option: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    backgroundColor: "#f9f9f9",
  },
  optionSelected: {
    borderColor: "#007AFF",
    backgroundColor: "#E3F2FD",
  },
  optionDisabled: {
    opacity: 0.7,
  },
  optionContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  optionText: {
    fontSize: 15,
    color: "#333",
    flex: 1,
  },
  optionTextSelected: {
    color: "#007AFF",
    fontWeight: "600",
  },
  progressContainer: {
    marginTop: 8,
    height: 6,
    backgroundColor: "#e0e0e0",
    borderRadius: 3,
    overflow: "hidden",
    position: "relative",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#007AFF",
    borderRadius: 3,
  },
  percentage: {
    position: "absolute",
    right: 4,
    top: -2,
    fontSize: 10,
    color: "#666",
  },
  voteCount: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  footer: {
    fontSize: 12,
    color: "#999",
    marginTop: 10,
  },
});

