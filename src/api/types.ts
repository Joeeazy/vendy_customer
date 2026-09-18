import type { components } from './schema';

type Schemas = components['schemas'];

export type Session = Schemas['SessionOut'];
export type User = Schemas['UserOut'];

export type Category = Schemas['CategoryOut'];
export type ServiceTypeDetail = Schemas['ServiceTypeOut'];
export type Neighbourhood = Schemas['NeighbourhoodOut'];
export type PublicStats = Schemas['PublicStatsOut'];

export type VendorCard = Schemas['VendorCard'];
export type VendorSearchResult = Schemas['VendorSearchResult'];
export type SearchResults = Schemas['SearchOut'];
export type SearchSort = Schemas['SearchSort'];
export type VendorProfile = Schemas['VendorPublicOut'];
export type OfferedService = Schemas['OfferedService'];
export type PortfolioItem = Schemas['PublicPortfolioItem'];
export type PriceItem = Schemas['PublicPriceItem'];
export type Review = Schemas['PublicReviewOut'];

export type BookingInput = Schemas['BookingIn'];
export type Booking = Schemas['CustomerBookingOut'];
export type BookingSummary = Schemas['CustomerBookingSummary'];
export type BookingStatus = Schemas['BookingStatus'];
export type PriceRevision = Schemas['PriceRevisionOut'];
export type BookingEvent = Schemas['BookingEventOut'];
export type VendorContact = Schemas['VendorContactOut'];
export type AwaitingReview = Schemas['AwaitingReviewOut'];
export type ReportKind = Schemas['ReportKind'];
export type Report = Schemas['ReportOut'];

export type Conversation = Schemas['ConversationOut'];
export type Message = Schemas['MessageOut'];
export type Messages = Schemas['MessagesOut'];

export type Notification = Schemas['NotificationOut'];
export type Media = Schemas['MediaOut'];
