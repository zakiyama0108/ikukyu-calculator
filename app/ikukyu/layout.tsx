import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '育休給付金シミュレーター | ikukyu',
  description: '産後から育休まで、もらえる給付金が全部わかる無料シミュレーターです。',
}

export default function IkukyuLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
