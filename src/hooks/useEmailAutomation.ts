import { supabase } from '@/lib/supabase';

export interface EmailAutomationData {
  eventType: string;
  recipientEmail: string;
  templateData: Record<string, string>;
  campaignId?: string;
}

export const useEmailAutomation = () => {
  const triggerAutomation = async (data: EmailAutomationData) => {
    try {
      const { data: result, error } = await supabase.functions.invoke('email-automation', {
        body: data
      });

      if (error) {
        console.error('Email automation error:', error);
        return { success: false, error: error.message };
      }

      return result;
    } catch (error) {
      console.error('Email automation error:', error);
      return { success: false, error: 'Failed to trigger email automation' };
    }
  };

  // Specific automation triggers
  const triggerWelcomeClient = (email: string, firstName: string) => {
    return triggerAutomation({
      eventType: 'user_signup_client',
      recipientEmail: email,
      templateData: { first_name: firstName }
    });
  };

  const triggerWelcomeTeam = (email: string, teamName: string) => {
    return triggerAutomation({
      eventType: 'user_signup_team',
      recipientEmail: email,
      templateData: { team_name: teamName }
    });
  };

  const triggerProjectCreated = (email: string, clientName: string, projectName: string, budget: string) => {
    return triggerAutomation({
      eventType: 'project_created',
      recipientEmail: email,
      templateData: { client_name: clientName, project_name: projectName, budget }
    });
  };

  const triggerTeamSelected = (email: string, clientName: string, teamName: string, projectName: string) => {
    return triggerAutomation({
      eventType: 'team_selected',
      recipientEmail: email,
      templateData: { client_name: clientName, team_name: teamName, project_name: projectName }
    });
  };

  const triggerEscrowFunded = (email: string, clientName: string, projectName: string, amount: string, transactionId: string) => {
    return triggerAutomation({
      eventType: 'escrow_funded',
      recipientEmail: email,
      templateData: { client_name: clientName, project_name: projectName, amount, transaction_id: transactionId }
    });
  };

  const triggerMilestoneSubmitted = (email: string, clientName: string, teamName: string, projectName: string, milestoneTitle: string) => {
    return triggerAutomation({
      eventType: 'milestone_submitted',
      recipientEmail: email,
      templateData: { client_name: clientName, team_name: teamName, project_name: projectName, milestone_title: milestoneTitle }
    });
  };

  const triggerMilestoneApproved = (email: string, teamName: string, projectName: string, milestoneTitle: string, amount: string) => {
    return triggerAutomation({
      eventType: 'milestone_approved',
      recipientEmail: email,
      templateData: { team_name: teamName, project_name: projectName, milestone_title: milestoneTitle, amount }
    });
  };

  return {
    triggerAutomation,
    triggerWelcomeClient,
    triggerWelcomeTeam,
    triggerProjectCreated,
    triggerTeamSelected,
    triggerEscrowFunded,
    triggerMilestoneSubmitted,
    triggerMilestoneApproved
  };
};