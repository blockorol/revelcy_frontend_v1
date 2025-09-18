import { DonutWithLegend } from '@components/base/DonutWithLegend';

  

export default function LoadingScreen() {
  return (
    <DonutWithLegend
    slices={[
        { label: '', value: 70, color: '#ffffff' }, // Остаток
        { label: 'Премаркет', value: 30, color: '#00FF6A' },
        { label: 'Огонь', value: 1, color: '#FF4C4C' },
    ]
    }
    />
  )
}
