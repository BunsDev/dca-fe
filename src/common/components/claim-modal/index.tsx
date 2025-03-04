import React from 'react';
import Modal from '@common/components/modal';
import styled from 'styled-components';
import { FormattedMessage } from 'react-intl';
import Grid from '@mui/material/Grid';
import CenteredLoadingIndicator from '@common/components/centered-loading-indicator';
import { Campaign, CampaignTypes, Campaigns, OptimismTypeData } from '@types';
import ClaimItem from './components/claim-items';
import OptimismAirdropClaimItem from './components/optimism-campaign';

const StyledContent = styled.div`
  background-color: #333333;
  border-radius: 4px;
  padding: 14px;
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 5px;
`;

const StyledClaimContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: left;
  flex: 1;
`;

interface ClaimModalProps {
  onCancel: () => void;
  open: boolean;
  campaigns?: Campaigns;
  isLoadingCampaigns: boolean;
}

const getCampaigItemComponent = (campaign: Campaign) => {
  let componentToReturn: React.ReactNode;
  switch (campaign.type) {
    case CampaignTypes.common: {
      componentToReturn = <ClaimItem campaign={campaign} />;
      break;
    }
    case CampaignTypes.optimismAirdrop: {
      componentToReturn = <OptimismAirdropClaimItem campaign={campaign as Campaign<OptimismTypeData>} />;
      break;
    }
    default: {
      break;
    }
  }
  return componentToReturn;
};

const ClaimModal = ({ open, onCancel, campaigns, isLoadingCampaigns }: ClaimModalProps) => {
  const handleCancel = () => {
    onCancel();
  };

  return (
    <Modal
      open={open}
      onClose={handleCancel}
      showCloseIcon
      maxWidth="sm"
      title={<FormattedMessage description="claimModal title" defaultMessage="Claim campaigns" />}
      actions={[]}
    >
      <StyledClaimContainer>
        <Grid container alignItems="stretch" rowSpacing={2}>
          {isLoadingCampaigns && !campaigns && <CenteredLoadingIndicator />}
          {campaigns &&
            !!campaigns.length &&
            campaigns.map((campaign) => (
              <Grid item xs={12} key={campaign.id} sx={{ paddingTop: '0px !important' }}>
                {getCampaigItemComponent(campaign)}
              </Grid>
            ))}
          {campaigns && !campaigns.length && (
            <StyledContent>
              <FormattedMessage description="claimModal noCampaigns" defaultMessage="No campaigns to claim" />
            </StyledContent>
          )}
        </Grid>
      </StyledClaimContainer>
    </Modal>
  );
};
export default ClaimModal;
