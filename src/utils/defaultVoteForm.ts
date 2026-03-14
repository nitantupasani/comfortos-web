import type { VoteFormSchema } from '../types';

export const DEFAULT_VOTE_FORM: VoteFormSchema = {
  version: 2,
  title: 'How do you feel right now?',
  description: 'A quick check-in helps the building respond faster to comfort issues.',
  fields: [
    {
      id: 'thermal_comfort',
      type: 'thermal_scale',
      question: 'How hot or cold do you feel?',
      required: true,
      min: -3,
      max: 3,
      defaultValue: 0,
      labels: { '-3': 'Cold', '0': 'Neutral', '3': 'Hot' },
    },
    {
      id: 'air_quality',
      type: 'emoji_scale',
      question: 'How is the air quality?',
      required: true,
      options: [
        { value: 1, emoji: '🤢', label: 'Stuffy' },
        { value: 2, emoji: '😐', label: 'Okay' },
        { value: 3, emoji: '😊', label: 'Fresh' },
      ],
    },
    { id: 'noise_level', type: 'rating_stars', question: 'Rate the noise level', maxStars: 5, required: false },
    { id: 'feedback', type: 'text_input', question: 'Any additional comments?', required: false },
  ],
};
