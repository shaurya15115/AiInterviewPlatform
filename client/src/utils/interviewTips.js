// Automatic interview tips and recommendations based on interview type

export const getTipsForInterviewType = (type) => {
  if (type === 'HR') {
    return {
      title: 'Behavioral Interview Tips',
      tips: [
        'Use the STAR method: Situation, Task, Action, Result',
        'Focus on your personal growth and learning from experiences',
        'Show genuine enthusiasm for the role and company',
        'Be authentic and honest about your experiences',
        'Provide specific examples rather than general statements',
        'Demonstrate emotional intelligence and self-awareness',
        'Discuss how you handle conflicts and challenges',
        'Show interest in team collaboration and company culture'
      ]
    };
  } else {
    return {
      title: 'Technical Interview Tips',
      tips: [
        'Think out loud and explain your approach before coding',
        'Ask clarifying questions about requirements and constraints',
        'Consider edge cases and error handling',
        'Discuss time and space complexity of your solution',
        'Write clean, readable code with meaningful variable names',
        'Test your solution with examples before finalizing',
        'Optimize your solution if time permits',
        'Explain trade-offs and alternative approaches'
      ]
    };
  }
};


