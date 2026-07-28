import { create } from 'zustand';

interface CapitalState {
  capital: number;
  setCapital: (amount: number) => void;
  resetCapital: () => void;
}

export const useCapitalStore = create<CapitalState>((set) => ({
  capital: 500000, // Default ₹5,00,000 (5 Lakhs)
  setCapital: (amount) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('user_capital', amount.toString());
    }
    set({ capital: amount });
  },
  resetCapital: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user_capital');
    }
    set({ capital: 500000 });
  },
}));

export const hydrateCapital = () => {
  if (typeof window === 'undefined') return;
  const stored = localStorage.getItem('user_capital');
  if (stored) {
    const val = parseFloat(stored);
    if (!isNaN(val) && val > 0) {
      useCapitalStore.setState({ capital: val });
    } else {
      useCapitalStore.setState({ capital: 500000 });
    }
  } else {
    useCapitalStore.setState({ capital: 500000 });
  }
};
