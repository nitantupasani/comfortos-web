import type { VoteFormSchema } from '../types';

/**
 * Default vote form. Used when the backend has no vote_form_schema
 * configured for a building.
 *
 * Field choices are grounded in established indoor environment research:
 *   - thermal_sensation : ASHRAE 55 7-point scale (Fanger PMV)
 *   - thermal_preference: McIntyre 3-point preference (warmer / no change / cooler)
 *   - thermal_acceptable: ASHRAE 55 acceptability (binary)
 *   - air_quality       : 5-point semantic differential (very stuffy → very fresh)
 *   - acoustic_comfort  : 5-point centered preference (too quiet ↔ just right ↔ too noisy)
 *   - adaptive_actions  : de Dear / Brager adaptive comfort actions
 *
 * No star-rating fields anywhere.
 */
export const DEFAULT_VOTE_FORM: VoteFormSchema = {
  version: 3,
  title: 'Comfort check-in',
  description: 'About 30 seconds. Helps the building tune to how you feel right now.',
  cooldownMinutes: 30,
  fields: [
    {
      id: 'thermal_sensation',
      type: 'thermal_scale',
      question: 'How do you feel right now?',
      required: true,
      min: -3,
      max: 3,
      defaultValue: 0,
      labels: {
        '-3': 'Cold',
        '-2': 'Cool',
        '-1': 'Slightly cool',
        '0': 'Neutral',
        '1': 'Slightly warm',
        '2': 'Warm',
        '3': 'Hot',
      },
      hint: 'ASHRAE 7-point thermal sensation',
    },
    {
      id: 'thermal_preference',
      type: 'single_select',
      question: 'Right now, you would prefer to be:',
      required: true,
      options: [
        { value: -1, label: 'Cooler',    color: 'blue',   emoji: '❄️' },
        { value: 0,  label: 'No change', color: 'green',  emoji: '👍' },
        { value: 1,  label: 'Warmer',    color: 'orange', emoji: '🔥' },
      ],
    },
    {
      id: 'thermal_acceptable',
      type: 'yes_no',
      question: 'Is the temperature acceptable to you?',
      required: true,
      yesLabel: 'Acceptable',
      noLabel: 'Not acceptable',
    },
    {
      id: 'air_quality',
      type: 'single_select',
      question: 'How is the air in here?',
      required: true,
      options: [
        { value: 1, label: 'Very stuffy', color: 'red'    },
        { value: 2, label: 'Stuffy',      color: 'orange' },
        { value: 3, label: 'Neutral',     color: 'amber'  },
        { value: 4, label: 'Fresh',       color: 'teal'   },
        { value: 5, label: 'Very fresh',  color: 'green'  },
      ],
    },
    {
      id: 'acoustic_comfort',
      type: 'single_select',
      question: 'How is the sound level?',
      required: false,
      options: [
        { value: -2, label: 'Much too quiet', color: 'blue'   },
        { value: -1, label: 'A bit too quiet', color: 'cyan'  },
        { value: 0,  label: 'Just right',      color: 'green' },
        { value: 1,  label: 'A bit too noisy', color: 'amber' },
        { value: 2,  label: 'Much too noisy',  color: 'red'   },
      ],
    },
    {
      id: 'adaptive_actions',
      type: 'multi_select',
      question: 'Anything you have already tried?',
      required: false,
      options: [
        { value: 'added_layer',   label: 'Added a layer',   emoji: '🧥' },
        { value: 'removed_layer', label: 'Removed a layer', emoji: '👕' },
        { value: 'opened_window', label: 'Opened a window', emoji: '🪟' },
        { value: 'fan',           label: 'Used a fan',      emoji: '🌀' },
        { value: 'moved',         label: 'Moved seats',     emoji: '🚶' },
        { value: 'drink',         label: 'Hot or cold drink', emoji: '☕' },
        { value: 'none',          label: 'Nothing',         exclusive: true, color: 'grey' },
      ],
    },
    {
      id: 'comments',
      type: 'text_input',
      question: 'Anything else? (optional)',
      required: false,
      maxLength: 280,
    },
  ],
};
