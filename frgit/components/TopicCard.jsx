import { useNavigate } from 'react-router-dom';
import { 
  Percent, Hash, Divide, Box, Ruler, Clock, 
  DollarSign, Calculator, FileQuestion, Equal, Shuffle, 
  Users, TrainFront, Layers, Beaker
} from 'lucide-react';

const TopicCard = ({ topic }) => {
  const navigate = useNavigate();

  // Helper to map topic names to edgy, minimalist Lucide React icons
  const getTopicIcon = (name) => {
    const ln = name.toLowerCase();
    
    // Icon components returned directly to be rendered
    if (ln.includes('percentage')) return <Percent strokeWidth={1.5} size={32} />;
    if (ln.includes('number')) return <Hash strokeWidth={1.5} size={32} />;
    if (ln.includes('fraction') || ln.includes('ratio') || ln.includes('proportion')) return <Divide strokeWidth={1.5} size={32} />;
    if (ln.includes('area') || ln.includes('volume')) return <Box strokeWidth={1.5} size={32} />;
    if (ln.includes('distance') || ln.includes('height')) return <Ruler strokeWidth={1.5} size={32} />;
    if (ln.includes('clock') || ln.includes('time') || ln.includes('ages') || ln.includes('work')) return <Clock strokeWidth={1.5} size={32} />;
    if (ln.includes('profit') || ln.includes('interest') || ln.includes('discount') || ln.includes('stock')) return <DollarSign strokeWidth={1.5} size={32} />;
    if (ln.includes('root') || ln.includes('surds') || ln.includes('indices') || ln.includes('logarithm')) return <Calculator strokeWidth={1.5} size={32} />;
    if (ln.includes('probability')) return <FileQuestion strokeWidth={1.5} size={32} />;
    if (ln.includes('simplification') || ln.includes('average')) return <Equal strokeWidth={1.5} size={32} />;
    if (ln.includes('h.c.f') || ln.includes('l.c.m')) return <Divide strokeWidth={1.5} size={32} />;
    if (ln.includes('permutation') || ln.includes('combination') || ln.includes('series')) return <Shuffle strokeWidth={1.5} size={32} />;
    if (ln.includes('partnership') || ln.includes('chain')) return <Users strokeWidth={1.5} size={32} />;
    if (ln.includes('mixture') || ln.includes('pipe')) return <Beaker strokeWidth={1.5} size={32} />;
    if (ln.includes('train') || ln.includes('boat')) return <TrainFront strokeWidth={1.5} size={32} />;
    
    // Fallback: Default layers icon
    return <Layers strokeWidth={1.5} size={32} />;
  };

  return (
    <div 
      onClick={() => navigate(`/aptitude/${topic._id}`)}
      className="border border-gray-800 bg-black hover:border-white transition-all duration-300 cursor-pointer group flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 md:p-8"
    >
      <div className="flex items-center gap-6 md:gap-8 flex-1">
        {/* Edgy sharp indicator block instead of a soft circle */}
        {topic.imageUrl ? (
          <img src={topic.imageUrl} alt={topic.name} className="w-16 h-16 object-none border border-gray-700 p-2" />
        ) : (
          <div className="w-16 h-16 border border-gray-700 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-colors duration-300 text-gray-500 shrink-0">
             {getTopicIcon(topic.name)}
          </div>
        )}
        
        <div className="flex flex-col max-w-2xl">
          <h2 className="text-xl md:text-2xl text-white font-bold tracking-widest uppercase mb-1">{topic.name}</h2>
          {topic.description && (
            <p className="text-gray-500 text-sm md:text-base leading-relaxed line-clamp-2">{topic.description}</p>
          )}
        </div>
      </div>
      
      <div className="mt-6 sm:mt-0 flex-shrink-0">
        <div className="flex items-center gap-3 text-white uppercase text-sm tracking-[0.2em] font-semibold group-hover:translate-x-2 transition-transform duration-300">
          <span>ENTER</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default TopicCard;
