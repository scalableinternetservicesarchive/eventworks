import { useQuery } from '@apollo/client';
import { Redirect, RouteComponentProps, useLocation } from '@reach/router';
import * as React from 'react';
import { useContext } from 'react';
import { fetchEvent } from '../../graphql/fetchEvent';
import { FetchEvent, FetchEventVariables } from '../../graphql/query.gen';
import { H2 } from '../../style/header';
import { LoggedInUserCtx, UserContext } from '../auth/user';
import { Room } from '../map/Room';
import { AppRouteParams, Route } from '../nav/route';
import { Page } from './Page';

interface EventMapPageProps extends RouteComponentProps, AppRouteParams {}

export function EventMapPage(props: EventMapPageProps) {
  const user = useContext(UserContext)
  const location = useLocation()
  const [, eventIdStr] = (location.search || '').split('?eventID=')

  const eventId = Number(eventIdStr)

  if (!user.user?.id) {
    return <Redirect to={`/${Route.HOME}`} />
  }

  return (
    <Page>
      <MapPage eventId={eventId} user={user as LoggedInUserCtx} />
    </Page>
  )
}

interface MapPageProps {
  user: LoggedInUserCtx
  eventId: number
}

export function MapPage({ user, eventId }: MapPageProps) {
  const { data, loading } = useQuery<FetchEvent, FetchEventVariables>(fetchEvent, {
    variables: { eventId, userId: user.user.id }
  })

  if (loading) {
    return (
      <Page>
        <H2>Loading event...</H2>
      </Page>
    )
  }

  if (!data?.event) {
    return (
      <Page>
        <H2>Event does not (or no longer) exist.</H2>
      </Page>
    )
  }

  const startTime = new Date(data.event.startTime)

  if (!data.event.host && startTime > new Date()) {
    return (
      <Page>
        <H2>{data.event.name} by {data.event.orgName} will begin at {startTime.toLocaleString()}.</H2>
      </Page>
    )
  }

  return (
    <Page>
      <Room event={data} user={user} />
    </Page>
  )
}