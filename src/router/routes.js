const routes = [
  {
    path: '/',
    component: () => import('@/components/menus/NowPlaying')
  },
  {
    path: '/current',
    component: () => import('@/components/lists/MainList')
  },
  {
    path: '/current/station',
    component: () => import('@/components/lists/StationList')
  },
  {
    path: '/location',
    component: () => import('@/components/lists/MainList')
  },
  {
    path: '/location/country',
    component: () => import('@/components/lists/SubList')
  },
  {
    path: '/location/country/station',
    component: () => import('@/components/lists/StationList')
  },
  {
    path: '/genre',
    component: () => import('@/components/lists/MainList')
  },
  {
    path: '/genre/country',
    component: () => import('@/components/lists/SubList')
  },
  {
    path: '/genre/country/station',
    component: () => import('@/components/lists/StationList')
  },
  {
    path: '/recommend',
    component: () => import('@/components/lists/MainList')
  },
  {
    path: '/recommend/station',
    component: () => import('@/components/lists/StationList')
  }
]

export default routes
