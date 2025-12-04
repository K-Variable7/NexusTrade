import { FaDiscord, FaTwitter, FaTelegram, FaGithub } from 'react-icons/fa';

export default function SocialLinks() {
  const socialLinks = [
    {
      name: 'Discord',
      url: 'https://discord.gg/nexustrade',
      icon: <FaDiscord className="w-6 h-6" />,
      color: 'hover:text-[#5865F2]'
    },
    {
      name: 'Twitter',
      url: 'https://twitter.com/nexustrade',
      icon: <FaTwitter className="w-6 h-6" />,
      color: 'hover:text-[#1DA1F2]'
    },
    {
      name: 'Telegram',
      url: 'https://t.me/nexustrade',
      icon: <FaTelegram className="w-6 h-6" />,
      color: 'hover:text-[#0088cc]'
    },
    {
      name: 'GitHub',
      url: 'https://github.com/nexustrade',
      icon: <FaGithub className="w-6 h-6" />,
      color: 'hover:text-white'
    }
  ];

  return (
    <div className="flex items-center gap-4 bg-white/5 backdrop-blur-sm px-6 py-3 rounded-full border border-white/10 shadow-lg">
      {socialLinks.map((link) => (
        <a
          key={link.name}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`text-gray-400 transition-colors duration-300 transform hover:scale-110 ${link.color}`}
          title={`Join us on ${link.name}`}
        >
          {link.icon}
        </a>
      ))}
    </div>
  );
}
