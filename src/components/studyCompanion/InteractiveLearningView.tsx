import React, { useState } from 'react';
import { GripVertical, RotateCcw, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function InteractiveLearningView({ language = 'en' }: { language?: string }) {
  const [orderingItems] = useState([
    { id: 1, text: 'Prophase: Chromosomes condense', order: 1 },
    { id: 2, text: 'Metaphase: Chromosomes align', order: 2 },
    { id: 3, text: 'Anaphase: Sister chromatids pull apart', order: 3 },
    { id: 4, text: 'Telophase: Nucleus reforms', order: 4 },
  ]);

  return (
    <div className="flex flex-col h-full overflow-y-auto p-4 bg-[#fafafa] dark:bg-[#111] space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Interactive Learning</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Master concepts through visual exercises</p>
        </div>
        <Button variant="outline" className="text-xs">Generate New Exercise</Button>
      </div>

      {/* Sequence Ordering */}
      <div className="bg-white dark:bg-[#1a1a1a] p-5 rounded-2xl border border-gray-200 dark:border-white/[0.08] shadow-sm space-y-4">
        <div>
          <div className="inline-flex items-center px-2 py-1 rounded-md bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-medium mb-2">Sequence Ordering</div>
          <h3 className="text-base font-medium text-gray-900 dark:text-gray-100">Order the stages of mitosis</h3>
        </div>
        
        <div className="space-y-2">
          {orderingItems.map((item, i) => (
            <div key={item.id} className="flex items-center gap-3 p-3 bg-white dark:bg-[#222] border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-grab">
              <GripVertical className="w-4 h-4 text-gray-400" />
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-800 text-xs font-medium text-gray-600 dark:text-gray-300">
                {i + 1}
              </div>
              <span className="text-sm text-gray-700 dark:text-gray-200">{item.text}</span>
            </div>
          ))}
        </div>

        <div className="flex gap-2 pt-2">
          <Button size="sm" className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900">Check Order</Button>
          <Button size="sm" variant="outline"><RotateCcw className="w-3.5 h-3.5 mr-1" /> Reset</Button>
        </div>
      </div>

      {/* Concept Matching */}
      <div className="bg-white dark:bg-[#1a1a1a] p-5 rounded-2xl border border-gray-200 dark:border-white/[0.08] shadow-sm space-y-4">
        <div>
          <div className="inline-flex items-center px-2 py-1 rounded-md bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-medium mb-2">Concept Matching</div>
          <h3 className="text-base font-medium text-gray-900 dark:text-gray-100">Match cell organelles to their functions</h3>
        </div>
        
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Terms</h4>
            {['Nucleus', 'Mitochondria', 'Ribosome', 'Cell Membrane'].map(term => (
              <div key={term} className="p-3 bg-white dark:bg-[#222] border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm cursor-pointer hover:border-emerald-400 transition-colors">
                {term}
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Definitions</h4>
            {['Protein synthesis', 'Controls what enters/exits', 'Contains genetic material', 'Energy production'].map(def => (
              <div key={def} className="p-3 bg-gray-50 dark:bg-[#222] border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-600 dark:text-gray-300 shadow-sm cursor-pointer hover:border-emerald-400 transition-colors">
                {def}
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button size="sm" className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900">Check Matches</Button>
          <Button size="sm" variant="outline"><RotateCcw className="w-3.5 h-3.5 mr-1" /> Reset</Button>
        </div>
      </div>

      {/* Fill the Gaps */}
      <div className="bg-white dark:bg-[#1a1a1a] p-5 rounded-2xl border border-gray-200 dark:border-white/[0.08] shadow-sm space-y-4">
        <div>
          <div className="inline-flex items-center px-2 py-1 rounded-md bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs font-medium mb-2">Fill the Gaps</div>
          <h3 className="text-base font-medium text-gray-900 dark:text-gray-100">Complete the Passage</h3>
        </div>
        
        <div className="p-4 bg-gray-50 dark:bg-[#222] rounded-xl text-sm text-gray-700 dark:text-gray-300 leading-loose">
          Photosynthesis is the process used by plants, algae and certain bacteria to harness energy from 
          <input type="text" className="mx-2 w-24 border-b-2 border-gray-300 dark:border-gray-600 bg-transparent px-1 text-center focus:outline-none focus:border-purple-500" placeholder="blank" /> 
          and turn it into chemical energy. It takes in 
          <input type="text" className="mx-2 w-24 border-b-2 border-gray-300 dark:border-gray-600 bg-transparent px-1 text-center focus:outline-none focus:border-purple-500" placeholder="blank" />
          and water, and produces 
          <input type="text" className="mx-2 w-24 border-b-2 border-gray-300 dark:border-gray-600 bg-transparent px-1 text-center focus:outline-none focus:border-purple-500" placeholder="blank" />
          and oxygen as a byproduct.
        </div>

        <div className="flex gap-2 pt-2">
          <Button size="sm" className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900">Check Answers</Button>
        </div>
      </div>

      {/* Label the Diagram */}
      <div className="bg-white dark:bg-[#1a1a1a] p-5 rounded-2xl border border-gray-200 dark:border-white/[0.08] shadow-sm space-y-4">
        <div>
          <div className="inline-flex items-center px-2 py-1 rounded-md bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-medium mb-2">Label the Diagram</div>
          <h3 className="text-base font-medium text-gray-900 dark:text-gray-100">Label the Components</h3>
        </div>
        
        <div className="relative w-full h-48 bg-gray-100 dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center">
          <ImageIcon className="w-8 h-8 text-gray-400 mb-2 absolute" />
          <span className="text-sm text-gray-500 dark:text-gray-400 mt-12">Diagram Area</span>
          
          <div className="absolute top-1/4 left-1/4 w-6 h-6 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-500 rounded-full flex items-center justify-center text-xs font-bold shadow-sm">1</div>
          <div className="absolute top-1/3 right-1/4 w-6 h-6 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-500 rounded-full flex items-center justify-center text-xs font-bold shadow-sm">2</div>
          <div className="absolute bottom-1/4 left-1/3 w-6 h-6 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-500 rounded-full flex items-center justify-center text-xs font-bold shadow-sm">3</div>
        </div>

        <div className="space-y-2 mt-4">
          {[1, 2, 3].map(num => (
            <div key={num} className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xs font-bold text-gray-700 dark:text-gray-300">{num}</div>
              <input type="text" className="flex-1 border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#222] rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-gray-900 dark:text-gray-100" placeholder={`Label ${num}`} />
            </div>
          ))}
        </div>

        <div className="flex gap-2 pt-2">
          <Button size="sm" className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900">Check Labels</Button>
        </div>
      </div>
    </div>
  );
}
