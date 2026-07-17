import { Injectable } from '@angular/core';
import { createClient, RealtimeChannel } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root',
})
export class SupabaseServieces {
  supabase = createClient(
    'https://fgcpeygzzrpsvwleawpc.supabase.co',
    'sb_publishable_8QmtMIVQLbmcr7hMHsdhCg_CjeMJCiq',
  );

  /**
   * Gets all surveys from database.
   */
  async getSurveys() {
    const { data, error } = await this.supabase
      .from('surveys')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      console.error(error);
      return [];
    }

    return data;
  }

  /**
   * Gets one survey by id.
   */
  async getSurveyById(id: number) {
    const { data, error } = await this.supabase.from('surveys').select('*').eq('id', id).single();
    return data;
  }

  /**
   * Gets questions for a survey.
   */
  async getQuestionsById(id: number) {
    const { data, error } = await this.supabase
      .from('questions')
      .select('*')
      .eq('survey_id', id)
      .order('id', { ascending: true });
    return data;
  }

  /**
   * Gets answers for a survey.
   */
  async getAnswersById(survey_id: number) {
    const { data, error } = await this.supabase
      .from('answers')
      .select('*')
      .eq('survey_id', survey_id)
      .order('id', { ascending: true });

    return data;
  }

  /**
   * Updates clicked count for an answer.
   * Adds or removes one click.
   */
  async updatedClickedAnswerInDB(answerId: number, add: boolean) {
    const { data } = await this.supabase
      .from('answers')
      .select('clicked')
      .eq('id', answerId)
      .single();

    await this.supabase
      .from('answers')
      .update({ clicked: (data?.clicked ?? 0) + (add ? 1 : -1) })
      .eq('id', answerId);
  }

  /**
   * Subscribes to realtime changes in answers table.
   */
  subscribeAnswers(callback: (payload: any) => void) {
    const channel = this.supabase
      .channel('custom-all-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'answers',
        },
        callback,
      )
      .subscribe();

    return channel;
  }

  /**
   * Creates a new survey.
   */
  async createSurvey(survey: {
    category: string;
    headline: string;
    endsDay: string;
    description: string;
  }) {
    const { data, error } = await this.supabase.from('surveys').insert(survey).select().single();
    if (error) console.error(error);
    return data;
  }

  /**
   * Creates a new question.
   */
  async createQuestion(question: {
    survey_id: string;
    multiple_choice: boolean;
    question_headline: string;
  }) {
    const { data, error } = await this.supabase
      .from('questions')
      .insert(question)
      .select()
      .single();
    if (error) console.error(error);
    return data;
  }

  /**
   * Creates a new answer.
   */
  async createAnswer(answer: { survey_id: string; question_id: string; answer_text: string }) {
    const { error } = await this.supabase.from('answers').insert(answer);
    if (error) console.error(error);
  }
}
