import { DataSource } from 'typeorm';
import { User } from '../../entities/user.entity';
import { College } from '../../entities/college.entity';

// This would typically connect to MongoDB to create posts
// For now, we'll create the data structure that would be inserted

export async function seedDummyPosts(dataSource: DataSource) {
  const userRepository = dataSource.getRepository(User);
  const collegeRepository = dataSource.getRepository(College);

  // Get all users and colleges
  const users = await userRepository.find({ relations: ['college'] });
  const colleges = await collegeRepository.find();

  const postTemplates = [
    {
      title: "The Ethics of AI in Education",
      content: "As AI becomes more prevalent in educational settings, we need to critically examine its implications. How do we balance efficiency with human connection? What are the long-term effects on critical thinking skills when students rely heavily on AI assistance?",
      panelType: "NATIONAL"
    },
    {
      title: "Climate Change: Individual vs Systemic Action",
      content: "There's an ongoing debate about whether climate change should be addressed through individual lifestyle changes or systemic policy reforms. What's the most effective approach? Can we do both simultaneously without diluting our efforts?",
      panelType: "NATIONAL"
    },
    {
      title: "The Role of Social Media in Democracy",
      content: "Social media platforms have fundamentally changed how we consume information and participate in democratic processes. Are these changes ultimately beneficial or harmful to democratic discourse? How can we promote healthy debate online?",
      panelType: "NATIONAL"
    },
    {
      title: "Universal Basic Income: Utopia or Necessity?",
      content: "With automation threatening traditional jobs, UBI is gaining traction as a potential solution. But is it economically viable? Would it reduce motivation to work, or free people to pursue more meaningful activities?",
      panelType: "NATIONAL"
    },
    {
      title: "The Philosophy of Consciousness",
      content: "What makes us conscious? Is consciousness an emergent property of complex neural networks, or something more fundamental? This question has implications for AI, ethics, and our understanding of what it means to be human.",
      panelType: "NATIONAL"
    },
    {
      title: "Genetic Engineering: Playing God or Saving Lives?",
      content: "CRISPR and other gene-editing technologies offer unprecedented power to modify human genetics. Should we use these tools to eliminate genetic diseases? What about enhancing human capabilities? Where do we draw ethical lines?",
      panelType: "NATIONAL"
    },
    {
      title: "The Future of Work in an Automated World",
      content: "As machines become capable of performing increasingly complex tasks, what will human work look like in the future? How should we prepare for a world where traditional career paths may no longer exist?",
      panelType: "NATIONAL"
    },
    {
      title: "Privacy vs Security in the Digital Age",
      content: "Governments and corporations collect vast amounts of personal data, often justified by security concerns or service improvements. How much privacy should we sacrifice for safety and convenience? Is true privacy even possible anymore?",
      panelType: "NATIONAL"
    },
    {
      title: "The Paradox of Choice in Modern Society",
      content: "We have more choices than ever before, yet many people report feeling overwhelmed and less satisfied with their decisions. Is having unlimited options actually making us less happy? How do we navigate choice overload?",
      panelType: "NATIONAL"
    },
    {
      title: "Cultural Relativism vs Universal Human Rights",
      content: "Can we respect cultural differences while maintaining universal standards for human rights? When cultural practices conflict with individual freedoms, how do we resolve these tensions without imposing Western values?",
      panelType: "NATIONAL"
    },
    {
      title: "The Attention Economy and Its Discontents",
      content: "Our attention has become a commodity, harvested by apps and platforms designed to maximize engagement. What are the psychological and social costs of this attention economy? How can we reclaim control over our focus?",
      panelType: "NATIONAL"
    },
    {
      title: "Effective Altruism: Maximizing Good or Missing the Point?",
      content: "The effective altruism movement advocates for using evidence and reason to determine how to do the most good. Critics argue it's too calculating and misses important aspects of moral behavior. What's your take?",
      panelType: "NATIONAL"
    },
    {
      title: "The Simulation Hypothesis: Are We Living in a Computer?",
      content: "Some philosophers and scientists seriously consider the possibility that our reality is a computer simulation. What would be the implications if this were true? Does it matter for how we live our lives?",
      panelType: "NATIONAL"
    },
    {
      title: "Mental Health Stigma in Academic Settings",
      content: "Despite increased awareness, mental health stigma persists in universities. How can we create environments where students feel safe seeking help? What role should institutions play in supporting student wellbeing?",
      panelType: "COLLEGE"
    },
    {
      title: "The Value of Liberal Arts in a STEM-Focused World",
      content: "With emphasis on STEM education for economic competitiveness, are we undervaluing liberal arts? What unique contributions do humanities and social sciences make to society and individual development?",
      panelType: "COLLEGE"
    },
    {
      title: "Grade Inflation: Symptom or Problem?",
      content: "Average grades have risen significantly over decades. Is this grade inflation reflecting improved teaching and learning, or does it mask declining standards? How does this affect student motivation and employer expectations?",
      panelType: "COLLEGE"
    },
    {
      title: "Campus Free Speech: Balancing Safety and Expression",
      content: "Universities struggle to balance free expression with creating safe, inclusive environments. How do we protect both the right to speak and the right to learn without fear? Where should limits be placed, if any?",
      panelType: "COLLEGE"
    },
    {
      title: "The Rising Cost of Higher Education",
      content: "College costs have outpaced inflation for decades, leaving many students with crushing debt. Is higher education still worth the investment? How can we make quality education more accessible?",
      panelType: "COLLEGE"
    },
    {
      title: "Remote Learning: Temporary Fix or Future of Education?",
      content: "The pandemic forced rapid adoption of remote learning. What have we learned about its effectiveness? Should universities continue offering online options, or is in-person education irreplaceable?",
      panelType: "COLLEGE"
    },
    {
      title: "Research Ethics in the Age of Big Data",
      content: "Academic researchers now have access to unprecedented amounts of data about human behavior. How do we balance research benefits with privacy concerns? What ethical frameworks should guide big data research?",
      panelType: "COLLEGE"
    }
  ];

  const dummyPosts = [];

  // Create posts with random assignments
  for (let i = 0; i < 20; i++) {
    const template = postTemplates[i];
    const randomUser = users[Math.floor(Math.random() * users.length)];
    
    // For college posts, try to use a college user
    let selectedUser = randomUser;
    if (template.panelType === 'COLLEGE') {
      const collegeUsers = users.filter(u => u.collegeId);
      if (collegeUsers.length > 0) {
        selectedUser = collegeUsers[Math.floor(Math.random() * collegeUsers.length)];
      }
    }

    const post = {
      authorId: selectedUser.id,
      authorName: selectedUser.displayName || selectedUser.username,
      authorUsername: selectedUser.username,
      authorRole: selectedUser.role,
      collegeId: selectedUser.collegeId,
      panelType: template.panelType,
      title: template.title,
      content: template.content,
      likes: Math.floor(Math.random() * 50) + 1, // 1-50 likes
      commentCount: Math.floor(Math.random() * 20) + 1, // 1-20 comments
      reportCount: 0,
      likedBy: [],
      isDeleted: false,
      isFlagged: false,
      isHidden: false,
      createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Within last week
      updatedAt: new Date()
    };

    dummyPosts.push(post);
  }

  console.log('Generated dummy posts data structure:');
  console.log(`Created ${dummyPosts.length} dummy posts`);
  
  // In a real implementation, you would insert these into MongoDB here
  // For now, we'll just return the data structure
  return dummyPosts;
}

// Export the posts data for potential use in other contexts
export const getDummyPostsData = () => {
  return [
    {
      title: "The Ethics of AI in Education",
      content: "As AI becomes more prevalent in educational settings, we need to critically examine its implications. How do we balance efficiency with human connection? What are the long-term effects on critical thinking skills when students rely heavily on AI assistance?",
      panelType: "NATIONAL"
    },
    {
      title: "Climate Change: Individual vs Systemic Action",
      content: "There's an ongoing debate about whether climate change should be addressed through individual lifestyle changes or systemic policy reforms. What's the most effective approach? Can we do both simultaneously without diluting our efforts?",
      panelType: "NATIONAL"
    },
    {
      title: "The Role of Social Media in Democracy",
      content: "Social media platforms have fundamentally changed how we consume information and participate in democratic processes. Are these changes ultimately beneficial or harmful to democratic discourse? How can we promote healthy debate online?",
      panelType: "NATIONAL"
    },
    {
      title: "Universal Basic Income: Utopia or Necessity?",
      content: "With automation threatening traditional jobs, UBI is gaining traction as a potential solution. But is it economically viable? Would it reduce motivation to work, or free people to pursue more meaningful activities?",
      panelType: "NATIONAL"
    },
    {
      title: "The Philosophy of Consciousness",
      content: "What makes us conscious? Is consciousness an emergent property of complex neural networks, or something more fundamental? This question has implications for AI, ethics, and our understanding of what it means to be human.",
      panelType: "NATIONAL"
    },
    {
      title: "Genetic Engineering: Playing God or Saving Lives?",
      content: "CRISPR and other gene-editing technologies offer unprecedented power to modify human genetics. Should we use these tools to eliminate genetic diseases? What about enhancing human capabilities? Where do we draw ethical lines?",
      panelType: "NATIONAL"
    },
    {
      title: "The Future of Work in an Automated World",
      content: "As machines become capable of performing increasingly complex tasks, what will human work look like in the future? How should we prepare for a world where traditional career paths may no longer exist?",
      panelType: "NATIONAL"
    },
    {
      title: "Privacy vs Security in the Digital Age",
      content: "Governments and corporations collect vast amounts of personal data, often justified by security concerns or service improvements. How much privacy should we sacrifice for safety and convenience? Is true privacy even possible anymore?",
      panelType: "NATIONAL"
    },
    {
      title: "The Paradox of Choice in Modern Society",
      content: "We have more choices than ever before, yet many people report feeling overwhelmed and less satisfied with their decisions. Is having unlimited options actually making us less happy? How do we navigate choice overload?",
      panelType: "NATIONAL"
    },
    {
      title: "Cultural Relativism vs Universal Human Rights",
      content: "Can we respect cultural differences while maintaining universal standards for human rights? When cultural practices conflict with individual freedoms, how do we resolve these tensions without imposing Western values?",
      panelType: "NATIONAL"
    },
    {
      title: "The Attention Economy and Its Discontents",
      content: "Our attention has become a commodity, harvested by apps and platforms designed to maximize engagement. What are the psychological and social costs of this attention economy? How can we reclaim control over our focus?",
      panelType: "NATIONAL"
    },
    {
      title: "Effective Altruism: Maximizing Good or Missing the Point?",
      content: "The effective altruism movement advocates for using evidence and reason to determine how to do the most good. Critics argue it's too calculating and misses important aspects of moral behavior. What's your take?",
      panelType: "NATIONAL"
    },
    {
      title: "The Simulation Hypothesis: Are We Living in a Computer?",
      content: "Some philosophers and scientists seriously consider the possibility that our reality is a computer simulation. What would be the implications if this were true? Does it matter for how we live our lives?",
      panelType: "NATIONAL"
    },
    {
      title: "Mental Health Stigma in Academic Settings",
      content: "Despite increased awareness, mental health stigma persists in universities. How can we create environments where students feel safe seeking help? What role should institutions play in supporting student wellbeing?",
      panelType: "COLLEGE"
    },
    {
      title: "The Value of Liberal Arts in a STEM-Focused World",
      content: "With emphasis on STEM education for economic competitiveness, are we undervaluing liberal arts? What unique contributions do humanities and social sciences make to society and individual development?",
      panelType: "COLLEGE"
    },
    {
      title: "Grade Inflation: Symptom or Problem?",
      content: "Average grades have risen significantly over decades. Is this grade inflation reflecting improved teaching and learning, or does it mask declining standards? How does this affect student motivation and employer expectations?",
      panelType: "COLLEGE"
    },
    {
      title: "Campus Free Speech: Balancing Safety and Expression",
      content: "Universities struggle to balance free expression with creating safe, inclusive environments. How do we protect both the right to speak and the right to learn without fear? Where should limits be placed, if any?",
      panelType: "COLLEGE"
    },
    {
      title: "The Rising Cost of Higher Education",
      content: "College costs have outpaced inflation for decades, leaving many students with crushing debt. Is higher education still worth the investment? How can we make quality education more accessible?",
      panelType: "COLLEGE"
    },
    {
      title: "Remote Learning: Temporary Fix or Future of Education?",
      content: "The pandemic forced rapid adoption of remote learning. What have we learned about its effectiveness? Should universities continue offering online options, or is in-person education irreplaceable?",
      panelType: "COLLEGE"
    },
    {
      title: "Research Ethics in the Age of Big Data",
      content: "Academic researchers now have access to unprecedented amounts of data about human behavior. How do we balance research benefits with privacy concerns? What ethical frameworks should guide big data research?",
      panelType: "COLLEGE"
    }
  ];
};