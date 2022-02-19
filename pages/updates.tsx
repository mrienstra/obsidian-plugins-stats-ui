
import React from 'react';
import Header from '../components/Header';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

import { PrismaClient } from "@prisma/client";
import AppCache from '../cache/appcache';
import moment from 'moment';
import showdown from 'showdown';

type Props = { };
type State = { };

const Updates = (props) => {
  const mdConverter = new showdown.Converter();
  mdConverter.setFlavor('github');
  
  return (
    <div>
      <Header />
      <Navbar current='updates'/>
      {/* New Plugins */}
      <div className='bg-violet-50 pt-5'>
        <div className='container w-full lg:w-1/2 mx-auto'>
          <div className='text-2xl py-5 uppercase pl-5 bg-gray-50'>
            🪴 New Versions {props.newReleases && `(${props.newReleases.length})`} 
          </div>
          <div className='flex-col'>
            {props.newReleases.map((newRelease, idx) => {
              return (
                <div key={newRelease.id} className='group flex py-2 bg-gray-50 hover:bg-white text-gray-700'>
                  <div className='text-xl lg:text-3xl font text-gray-400 pl-5 lg:pr-5'>{String(idx+1).padStart(2, '0')} </div>
                  <div className='text-xl lg:text-3xl font text-violet-900 px-5 py-1 lg:py-2 basis:28 lg:basis-40 text-center shrink-0'>
                    <span className='bg-violet-900 text-violet-100 px-2 rounded-md'>{newRelease.latestRelease}</span>
                  </div>
                  <div>
                    <a href={`https://github.com/${newRelease.repo}`} target="_blank" rel="noreferrer" className='text-xl font-medium text-violet-900'>{newRelease.name}</a>
                    <div className='text-sm'>{moment(newRelease.latestReleaseAt).fromNow()} by <span className='group-hover:text-violet-500'>{newRelease.author}</span></div>
                    <details>
                      <summary className='text-violet-700'>Changelog</summary>
                      <div dangerouslySetInnerHTML={{__html: mdConverter.makeHtml(newRelease.latestReleaseDesc)}} />
                    </details>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

const daysAgo = (days: number) => Date.now() - (days * 24 * 60 * 60 * 1000)

export const getStaticProps = async () => {
  let prisma: PrismaClient;

  let newReleases = AppCache.get('new_releases') || [];
  if (newReleases.length <= 0) {
    if (!prisma) prisma = new PrismaClient();
    newReleases = await prisma.plugin.findMany({
      where: {
        latestReleaseAt: {
          gt: daysAgo(10),
        }
      }
    });
    newReleases.sort((a, b) => b.latestReleaseAt - a.latestReleaseAt)
    AppCache.set('new_releases', newReleases);
  }

  return { props: { newReleases } };
}

export default Updates;
