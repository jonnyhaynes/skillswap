import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router';
import { useSkills } from '@/hooks/useSkills';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { SkillBadge } from '@/components/skills/SkillBadge';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { formatDate } from '@/utils/formatDate';
import { cn } from '@/utils/cn';

export function SkillDetailPage() {
  const { skillId } = useParams();
  const navigate = useNavigate();
  const { getListingById, deleteListing } = useSkills();
  const { currentUser, getUserById } = useAuth();
  const { addToast } = useToast();

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const listing = skillId ? getListingById(skillId) : undefined;
  const listingUser = listing ? getUserById(listing.userId) : undefined;

  if (!listing || !listingUser) {
    return (
      <EmptyState
        icon={
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        }
        title="Listing not found"
        description="The skill listing you're looking for doesn't exist or has been removed."
        action={{
          label: 'Browse Skills',
          onClick: () => navigate('/browse'),
        }}
      />
    );
  }

  const isOwner = currentUser?.id === listing.userId;

  const handleDelete = () => {
    deleteListing(listing.id);
    addToast('Listing deleted successfully', 'success');
    navigate('/my-listings');
  };

  const handleProposeSwap = () => {
    addToast('Swap proposals coming soon!', 'info');
  };

  return (
    <div className="space-y-6">
      <Link
        to="/browse"
        className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Browse
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            <SkillBadge category={listing.category} size="md" />
            <Badge variant={listing.listingType === 'offered' ? 'success' : 'warning'}>
              {listing.listingType === 'offered' ? 'Offering' : 'Seeking'}
            </Badge>
          </div>

          <h1 className="text-3xl font-bold text-slate-900">{listing.title}</h1>

          <div className="prose prose-slate max-w-none">
            <p className="text-slate-600 whitespace-pre-wrap leading-relaxed">
              {listing.description}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <h3 className="text-sm font-medium text-slate-500">Level</h3>
              <p className="text-sm text-slate-900 capitalize">{listing.level}</p>
            </div>

            {listing.availability && (
              <div className="space-y-1">
                <h3 className="text-sm font-medium text-slate-500">Availability</h3>
                <p className="text-sm text-slate-900">{listing.availability}</p>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {listing.isInPerson && (
              <Badge variant="info">
                <span className="flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  In person
                </span>
              </Badge>
            )}
            {listing.isRemote && (
              <Badge variant="info">
                <span className="flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Remote
                </span>
              </Badge>
            )}
          </div>

          {listing.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {listing.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <p className="text-xs text-slate-400">
            Posted on {formatDate(listing.createdAt)}
          </p>
        </div>

        <div className="space-y-4">
          <Card className="p-6">
            <div className="flex flex-col items-center text-center">
              <Avatar
                src={listingUser.avatarUrl}
                name={`${listingUser.firstName} ${listingUser.lastName}`}
                size="lg"
              />
              <h3 className="mt-3 text-lg font-semibold text-slate-900">
                {listingUser.firstName} {listingUser.lastName}
              </h3>
              <p className="text-sm text-slate-500">{listingUser.neighbourhood}</p>
              {listingUser.isVerifiedNeighbour && (
                <Badge variant="success" className="mt-2">
                  <span className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Verified Neighbour
                  </span>
                </Badge>
              )}
            </div>

            <div className="mt-6 space-y-3">
              <Link to={`/profile/${listingUser.id}`}>
                <Button variant="outline" className="w-full">
                  View Profile
                </Button>
              </Link>

              {!isOwner && (
                <Button variant="primary" className="w-full" onClick={handleProposeSwap}>
                  Propose a Swap
                </Button>
              )}
            </div>
          </Card>

          {isOwner && (
            <Card className="p-6">
              <h3 className="text-sm font-medium text-slate-700 mb-3">Manage Listing</h3>
              <div className="space-y-3">
                <Link to={`/skills/${listing.id}/edit`}>
                  <Button variant="outline" className="w-full">
                    Edit Listing
                  </Button>
                </Link>
                <Button
                  variant="danger"
                  className="w-full"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  Delete Listing
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={showDeleteDialog}
        title="Delete Listing"
        message="Are you sure you want to delete this listing? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteDialog(false)}
      />
    </div>
  );
}
