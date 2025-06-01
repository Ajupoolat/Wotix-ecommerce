import React from 'react'
import AdminSidebar from '../reuse/sidebar/sidebar'
import { Button } from '@/components/ui/button'
import { Avatar,AvatarImage,AvatarFallback } from '@/components/ui/avatar'

const CommonError = ({Route ,m1,m2}) => {
  return (
     <div className="flex min-h-screen bg-gray-100">
        <AdminSidebar activeRoute={Route} />
        <div className="flex-1 flex flex-col">
          <header className="bg-white border-b p-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Avatar>
                  <AvatarImage
                    src="https://github.com/shadcn.png"
                    alt="Admin"
                  />
                  <AvatarFallback>AD</AvatarFallback>
                </Avatar>
                <span className="text-gray-800">Admin</span>
              </div>
            </div>
          </header>
          <main className="p-6 flex items-center justify-center h-full">
            <div className="text-center">
              <h2 className="text-xl font-bold text-red-500 mb-2">
                {m2}
              </h2>
              <p className="text-gray-600 mb-4">
                {m1}
              </p>
              <Button
                onClick={() => window.location.reload()}
                className="bg-black text-white"
              >
                Retry
              </Button>
            </div>
          </main>
        </div>
      </div>
  )
}

export default CommonError