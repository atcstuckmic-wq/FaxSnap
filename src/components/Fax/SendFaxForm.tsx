import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Send, Phone, MessageCircle, Coins } from 'lucide-react';
import { PHONE_REGEX } from '../../config/constants';
import Button from '../UI/Button';
import Card from '../UI/Card';
import FileUpload from '../FileUpload/FileUpload';
import toast from 'react-hot-toast';
import { telnyxService } from '../../services/telnyx';
import { FileUploadService } from '../../services/fileUpload';
import { supabase } from '../../config/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface SendFaxFormProps {
  userTokens: number;
  onFaxSent: () => void;
}

const schema = yup.object({
  recipientNumber: yup
    .string()
    .matches(PHONE_REGEX, 'Please enter a valid phone number')
    .required('Phone number is required'),
  coverMessage: yup.string().max(500, 'Cover message must be under 500 characters'),
});

const SendFaxForm: React.FC<SendFaxFormProps> = ({ userTokens, onFaxSent }) => {
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [sending, setSending] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: any) => {
    if (!selectedFile) {
      toast.error('Please select a file to send');
      return;
    }

    if (userTokens < 1) {
      toast.error('Insufficient tokens. Please purchase more tokens.');
      return;
    }

    if (!user) {
      toast.error('You must be logged in to send faxes');
      return;
    }

    setSending(true);
    try {
      // Step 1: Upload file to get a public URL
      toast.loading('Uploading document...', { id: 'upload' });
      const mediaUrl = await FileUploadService.uploadFile(selectedFile);
      toast.dismiss('upload');

      // Step 2: Send fax via Telnyx
      toast.loading('Sending fax...', { id: 'send' });
      const faxResponse = await telnyxService.sendFax({
        to: data.recipientNumber,
        from: '+15551234567', // Your fax number from Telnyx
        media_url: mediaUrl,
        store_media: true,
      });
      toast.dismiss('send');

      // Step 3: Store fax record in database
      const { error: dbError } = await supabase.from('faxes').insert({
        user_id: user.id,
        recipient_number: data.recipientNumber,
        document_url: mediaUrl,
        cover_message: data.coverMessage || null,
        telnyx_fax_id: faxResponse.data.id,
        status: 'pending',
        tokens_used: tokensNeeded,
      });

      if (dbError) {
        console.error('Failed to save fax record:', dbError);
        // Don't fail the request if we can't save to DB
      }

      // Step 4: Deduct tokens from user account
      // Use the new token system
      const { data: tokenResult, error: tokenError } = await supabase
        .rpc('use_tokens', {
          user_uuid: user.id,
          tokens_needed: tokensNeeded
        });

      if (tokenError || !tokenResult) {
        console.error('Failed to use tokens:', tokenError);
        toast.error('Fax sent but failed to deduct tokens. Please contact support.');
      }
      
      toast.success('Fax sent successfully!');
      reset();
      setSelectedFile(null);
      onFaxSent();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`Failed to send fax: ${errorMessage}`);
      console.error('Fax send error:', error);
    } finally {
      setSending(false);
    }
  };

  const tokensNeeded = 1; // In real app, calculate based on pages

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <div className="flex items-center space-x-3 mb-6">
          <div className="flex-shrink-0 w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
            <Send className="h-6 w-6 text-primary-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Send New Fax</h2>
            <p className="text-sm text-gray-600">Upload your document and send it instantly</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Document
            </label>
            <FileUpload
              onFileSelect={setSelectedFile}
              selectedFile={selectedFile}
              onFileRemove={() => setSelectedFile(null)}
            />
          </div>

          <div>
            <label htmlFor="recipientNumber" className="block text-sm font-medium text-gray-700 mb-2">
              <Phone className="inline h-4 w-4 mr-1" />
              Recipient Phone Number
            </label>
            <input
              {...register('recipientNumber')}
              type="tel"
              id="recipientNumber"
              placeholder="+1234567890"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
            />
            {errors.recipientNumber && (
              <p className="mt-1 text-sm text-red-600">{errors.recipientNumber.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="coverMessage" className="block text-sm font-medium text-gray-700 mb-2">
              <MessageCircle className="inline h-4 w-4 mr-1" />
              Cover Message (Optional)
            </label>
            <textarea
              {...register('coverMessage')}
              id="coverMessage"
              rows={3}
              placeholder="Enter an optional cover message..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors resize-none"
            />
            {errors.coverMessage && (
              <p className="mt-1 text-sm text-red-600">{errors.coverMessage.message}</p>
            )}
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Coins className="h-5 w-5 text-primary-600" />
                <span className="text-sm font-medium text-gray-700">Cost:</span>
              </div>
              <div className="text-right">
                <span className="text-lg font-semibold text-primary-600">
                  {tokensNeeded} token{tokensNeeded === 1 ? '' : 's'}
                </span>
                <p className="text-xs text-gray-500">
                  You have {userTokens} token{userTokens === 1 ? '' : 's'}
                </p>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            size="lg"
            loading={sending}
            disabled={!selectedFile || userTokens < tokensNeeded}
            className="w-full"
            icon={Send}
          >
            {sending ? 'Sending Fax...' : 'Send Fax'}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default SendFaxForm;