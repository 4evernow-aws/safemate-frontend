import type { LandingPageContent } from '../types/content';

export const landingContent: LandingPageContent = {
  hero: {
    title: "It's Safe Mate!",
    subtitle: "Everyone should have the ability to secure and share their most cherished assets in life. Assets such as memories, important documents, and personal messages - with 100% confidence that they will be safe and protected now and for generations to come.",
    primary_cta_text: "Get Started",
    primary_cta_link: "/app",
    secondary_cta_text: "Learn More",
    secondary_cta_link: "/faq"
  },
  
  function: {
    title: "SafeMate has many uses",
    subtitle: "From personal memories to business documents, SafeMate secures what matters most to you.",
    features: [
      {
        icon: "🔒",
        title: "Personal",
        description: "• Important Documents\n• Family Photos\n• Home Videos\n• Personal Audio\n• Digital Archives\n• Private Messages"
      },
      {
        icon: "🛡️",
        title: "Family",
        description: "• Family Documents\n• Family Photos\n• Family Videos\n• Family Audio\n• Family Archives\n• Family Messages"
      },
      {
        icon: "⚡",
        title: "Business",
        description: "• Business Documents\n• Company Records\n• Client Files\n• Financial Data\n• Legal Contracts\n• Business Assets"
      },
      {
        icon: "⏰",
        title: "Community",
        description: "• Community Groups\n• Community Events\n• Community Videos\n• Educational Content\n• Public Records\n• Shared Resources"
      },
      {
        icon: "📤",
        title: "Sporting teams",
        description: "• Team Photos\n• Game Videos\n• Trophy Room\n• Team History\n• Season Archives\n• Team Events"
      },
      {
        icon: "🔧",
        title: "Cultural",
        description: "• Cultural Heritage\n• Cultural Events\n• Cultural Videos\n• Traditional Music\n• Cultural History\n• Cultural Education"
      }
    ]
  },
  
  features: {
    title: "It's yours. It's Safe.",
    subtitle: "Discover how SafeMate revolutionizes the way you store, manage, and share your digital assets.",
    features: [
      {
        icon: "🔒",
        title: "Private",
        description: "Your data stays yours. End-to-end encryption ensures only you have access to your assets."
      },
      {
        icon: "🛡️",
        title: "Secure", 
        description: "Military-grade security protocols protect your digital assets from any threat."
      },
      {
        icon: "⚡",
        title: "Simple",
        description: "Intuitive design makes managing your assets as easy as sending a text message."
      },
      {
        icon: "⏰",
        title: "Timeless",
        description: "Built to last generations. Your digital legacy is preserved for the future."
      },
      {
        icon: "📤",
        title: "Shareable",
        description: "Share assets securely with family and friends with just a few clicks."
      },
      {
        icon: "🔧",
        title: "Flexible",
        description: "Adapt to your needs. Customize your experience with powerful tools and options."
      }
    ]
  },

  useCases: {
    title: "SafeMate has many uses",
    subtitle: "From personal memories to business documents, SafeMate secures what matters most to you.",
    categories: [
      {
        title: "Personal",
        icon: "👤",
        items: [
          "Important Documents",
          "Family Photos", 
          "Home Videos",
          "Personal Audio",
          "Digital Archives",
          "Private Messages"
        ]
      },
      {
        title: "Family",
        icon: "👨‍👩‍👧‍👦",
        items: [
          "Family Tree",
          "Family Photos",
          "Family Videos",
          "Family Stories", 
          "Family Events",
          "Family History"
        ]
      },
      {
        title: "Business",
        icon: "💼",
        items: [
          "Business Documents",
          "Company Records",
          "Client Files",
          "Financial Data",
          "Legal Contracts",
          "Business Assets"
        ]
      },
      {
        title: "Community",
        icon: "🏘️",
        items: [
          "Community Events",
          "Group Photos",
          "Shared Memories",
          "Local History",
          "Community Projects",
          "Cultural Heritage"
        ]
      },
      {
        title: "Sporting Teams",
        icon: "⚽",
        items: [
          "Team Photos",
          "Match Videos",
          "Player Records",
          "Team History",
          "Championship Moments",
          "Training Materials"
        ]
      },
      {
        title: "Cultural",
        icon: "🎭",
        items: [
          "Cultural Events",
          "Group Photos",
          "Shared Memories",
          "Local History",
          "Cultural Projects",
          "Cultural Heritage"
        ]
      }
    ]
  },
  
  roadmap: {
    title: "Development Roadmap",
    subtitle: "Our journey to revolutionize digital asset preservation and build the future of blockchain-based memory storage.",
    cta_text: "Join Our Journey - Start Testing Now!",
    cta_link: "/login",
    timeline: [
      {
        title: "Phase 1: Foundation",
        period: "2022-2026",
        status: "in-progress",
        tasks: [
          { text: "Market Research", status: "completed" },
          { text: "Collaboration", status: "completed" },
          { text: "Product Development", status: "in-progress" }
        ]
      },
      {
        title: "Phase 2: TestNet Launch",
        period: "2022-2023",
        status: "completed",
        tasks: [
          { text: "Product Testing", status: "completed" },
          { text: "TestNet Alpha/Beta Ready", status: "completed" },
          { text: "Token Release", status: "completed" }
        ]
      },
      {
        title: "Phase 3: MainNet & Growth",
        period: "2023-2024",
        status: "in-progress",
        tasks: [
          { text: "Partnerships & Marketing", status: "completed" },
          { text: "Token Implementation", status: "in-progress" },
          { text: "MainNet Production Release", status: "planned" }
        ]
      },
      {
        title: "Phase 4: Global Expansion",
        period: "2024-2026",
        status: "planned",
        tasks: [
          { text: "Full Platform Launch", status: "planned" },
          { text: "Global Expansion", status: "planned" },
          { text: "Advanced Features", status: "planned" },
          { text: "Community Governance", status: "planned" }
        ]
      }
    ]
  },
  
  tokenomics: {
    title: "Rewards & Storage",
    subtitle: "Earn MATE Rewards on Hedera-Powered Storage",
    description: "SafeMate uses Hedera Hashgraph (HBAR) for secure blockchain storage, while MATE tokens serve as reward points for platform participation. Upload files, earn MATE rewards, and enjoy secure document storage powered by Hedera's distributed ledger technology.",
    cta_text: "Learn More",
    cta_link: "/faq",
    token_info: {
      initial_supply: "10,000,000,000",
      max_supply: "10,000,000,000", 
      token_id: "0.0.7779374",
      network: "Hedera Hashgraph"
    },
    distribution: [
      {
        category: "Research and Development",
        percentage: 30,
        color: "#4A90E2"
      },
      {
        category: "Marketing and Growth", 
        percentage: 30,
        color: "#7ED321"
      },
      {
        category: "Business Operations",
        percentage: 20,
        color: "#F5A623"
      },
      {
        category: "Liquidity",
        percentage: 10,
        color: "#D0021B"
      },
      {
        category: "Community",
        percentage: 10,
        color: "#9013FE"
      }
    ]
  },
  
  footer: {
    tagline: "Making your digital memories last forever, starting today.",
    contact_email: "hello@forevernow.world", 
    website: "forevernow.world",
    copyright: "© 2024 SafeMate. All rights reserved. Built with ❤️ by the ForeverNow team."
  }
}; 