import { Resend } from 'resend';

// Initialize Resend with API key from environment
const resend = new Resend(process.env.RESEND_API_KEY);

// Production email configuration - Domain verified in Resend
const ADMIN_EMAIL = 'contact@bestinvestcamimob.ro';
const FROM_EMAIL = 'noreply@camimob.ro';

interface ContactFormEmail {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
}

interface PropertySubmissionEmail {
  ownerName: string;
  phone: string;
  email: string;
  propertyType: string;
  operationType: string;
  locality: string;
  zone: string;
  address: string;
  surface: number;
  rooms?: number;
  floor?: number;
  totalFloors?: number;
  estimatedPrice: number;
  description: string;
  features?: string;
  submissionId: number;
}

interface ServiceRequestEmail {
  serviceName: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  additionalInfo?: Record<string, any>;
}

/**
 * Send contact form notification to admin
 */
export async function sendContactFormNotification(data: ContactFormEmail) {
  try {
    const subjectMap: Record<string, string> = {
      'buy': 'Cumpărare',
      'sell': 'Vânzare',
      'rent': 'Închiriere',
    };

    const subjectText = data.subject ? subjectMap[data.subject] || 'General' : 'General';

    const { data: emailData, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: `[CONTACT FORM] ${subjectText} - ${data.name}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
              .field { margin-bottom: 20px; }
              .label { font-weight: bold; color: #1e40af; display: block; margin-bottom: 5px; }
              .value { background: white; padding: 12px; border-left: 3px solid #1e40af; border-radius: 4px; }
              .footer { background: #374151; color: white; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="margin: 0; font-size: 24px;">📧 Formular Contact Nou</h1>
                <p style="margin: 10px 0 0 0; opacity: 0.9;">BESTINVEST CAMIMOB</p>
              </div>

              <div class="content">
                <div class="field">
                  <span class="label">👤 Nume:</span>
                  <div class="value">${data.name}</div>
                </div>

                <div class="field">
                  <span class="label">📧 Email:</span>
                  <div class="value"><a href="mailto:${data.email}">${data.email}</a></div>
                </div>

                ${data.phone ? `
                <div class="field">
                  <span class="label">📱 Telefon:</span>
                  <div class="value"><a href="tel:${data.phone}">${data.phone}</a></div>
                </div>
                ` : ''}

                <div class="field">
                  <span class="label">📋 Subiect:</span>
                  <div class="value">${subjectText}</div>
                </div>

                <div class="field">
                  <span class="label">💬 Mesaj:</span>
                  <div class="value">${data.message.replace(/\n/g, '<br>')}</div>
                </div>
              </div>

              <div class="footer">
                <p style="margin: 0;">Acest email a fost generat automat de sistemul BESTINVEST CAMIMOB</p>
                <p style="margin: 5px 0 0 0;">www.camimob.ro</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error('Error sending contact form email:', error);
      return { success: false, error };
    }

    console.log('Contact form email sent successfully:', emailData);
    return { success: true, data: emailData };
  } catch (error) {
    console.error('Failed to send contact form email:', error);
    return { success: false, error };
  }
}

/**
 * Send property submission notification to admin
 */
export async function sendPropertySubmissionNotification(data: PropertySubmissionEmail) {
  try {
    const { data: emailData, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: `[LISTARE PROPRIETATE] ${data.propertyType} - ${data.locality}, ${data.zone}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #059669 0%, #10b981 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
              .section { margin-bottom: 25px; }
              .section-title { font-size: 18px; font-weight: bold; color: #059669; margin-bottom: 15px; border-bottom: 2px solid #059669; padding-bottom: 5px; }
              .field { margin-bottom: 15px; }
              .label { font-weight: bold; color: #059669; display: inline-block; width: 150px; }
              .value { display: inline-block; }
              .highlight { background: white; padding: 15px; border-left: 4px solid #059669; border-radius: 4px; margin: 10px 0; }
              .footer { background: #374151; color: white; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="margin: 0; font-size: 24px;">🏠 Listare Proprietate Nouă</h1>
                <p style="margin: 10px 0 0 0; opacity: 0.9;">BESTINVEST CAMIMOB</p>
              </div>

              <div class="content">
                <div class="highlight">
                  <strong>ID Submission:</strong> #${data.submissionId}<br>
                  <strong>Tip:</strong> ${data.propertyType} de ${data.operationType}
                </div>

                <div class="section">
                  <div class="section-title">👤 Date Contact Proprietar</div>
                  <div class="field">
                    <span class="label">Nume:</span>
                    <span class="value">${data.ownerName}</span>
                  </div>
                  <div class="field">
                    <span class="label">Email:</span>
                    <span class="value"><a href="mailto:${data.email}">${data.email}</a></span>
                  </div>
                  <div class="field">
                    <span class="label">Telefon:</span>
                    <span class="value"><a href="tel:${data.phone}">${data.phone}</a></span>
                  </div>
                </div>

                <div class="section">
                  <div class="section-title">📍 Locație</div>
                  <div class="field">
                    <span class="label">Localitate:</span>
                    <span class="value">${data.locality}</span>
                  </div>
                  <div class="field">
                    <span class="label">Zonă:</span>
                    <span class="value">${data.zone}</span>
                  </div>
                  <div class="field">
                    <span class="label">Adresă:</span>
                    <span class="value">${data.address}</span>
                  </div>
                </div>

                <div class="section">
                  <div class="section-title">🏗️ Detalii Proprietate</div>
                  <div class="field">
                    <span class="label">Suprafață:</span>
                    <span class="value">${data.surface} mp</span>
                  </div>
                  ${data.rooms ? `
                  <div class="field">
                    <span class="label">Camere:</span>
                    <span class="value">${data.rooms}</span>
                  </div>
                  ` : ''}
                  ${data.floor ? `
                  <div class="field">
                    <span class="label">Etaj:</span>
                    <span class="value">${data.floor}${data.totalFloors ? ` / ${data.totalFloors}` : ''}</span>
                  </div>
                  ` : ''}
                  <div class="field">
                    <span class="label">Preț estimat:</span>
                    <span class="value"><strong>${new Intl.NumberFormat('ro-RO').format(data.estimatedPrice)} EUR</strong></span>
                  </div>
                </div>

                <div class="section">
                  <div class="section-title">📝 Descriere</div>
                  <div style="background: white; padding: 15px; border-radius: 4px;">
                    ${data.description.replace(/\n/g, '<br>')}
                  </div>
                </div>

                ${data.features ? `
                <div class="section">
                  <div class="section-title">✨ Caracteristici</div>
                  <div style="background: white; padding: 15px; border-radius: 4px;">
                    ${data.features.replace(/\n/g, '<br>')}
                  </div>
                </div>
                ` : ''}
              </div>

              <div class="footer">
                <p style="margin: 0;">Acest email a fost generat automat de sistemul BESTINVEST CAMIMOB</p>
                <p style="margin: 5px 0 0 0;">www.camimob.ro</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error('Error sending property submission email:', error);
      return { success: false, error };
    }

    console.log('Property submission email sent successfully:', emailData);
    return { success: true, data: emailData };
  } catch (error) {
    console.error('Failed to send property submission email:', error);
    return { success: false, error };
  }
}

/**
 * Send service request notification to admin
 */
export async function sendServiceRequestNotification(data: ServiceRequestEmail) {
  try {
    const { data: emailData, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: `[${data.serviceName.toUpperCase()}] Cerere nouă - ${data.name}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
              .field { margin-bottom: 20px; }
              .label { font-weight: bold; color: #7c3aed; display: block; margin-bottom: 5px; }
              .value { background: white; padding: 12px; border-left: 3px solid #7c3aed; border-radius: 4px; }
              .footer { background: #374151; color: white; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="margin: 0; font-size: 24px;">🎯 ${data.serviceName}</h1>
                <p style="margin: 10px 0 0 0; opacity: 0.9;">BESTINVEST CAMIMOB</p>
              </div>

              <div class="content">
                <div class="field">
                  <span class="label">👤 Nume:</span>
                  <div class="value">${data.name}</div>
                </div>

                <div class="field">
                  <span class="label">📧 Email:</span>
                  <div class="value"><a href="mailto:${data.email}">${data.email}</a></div>
                </div>

                ${data.phone ? `
                <div class="field">
                  <span class="label">📱 Telefon:</span>
                  <div class="value"><a href="tel:${data.phone}">${data.phone}</a></div>
                </div>
                ` : ''}

                <div class="field">
                  <span class="label">💬 Mesaj:</span>
                  <div class="value">${data.message.replace(/\n/g, '<br>')}</div>
                </div>

                ${data.additionalInfo && Object.keys(data.additionalInfo).length > 0 ? `
                <div class="field">
                  <span class="label">📋 Informații suplimentare:</span>
                  <div class="value">
                    ${Object.entries(data.additionalInfo)
                      .map(([key, value]) => `<strong>${key}:</strong> ${value}`)
                      .join('<br>')}
                  </div>
                </div>
                ` : ''}
              </div>

              <div class="footer">
                <p style="margin: 0;">Acest email a fost generat automat de sistemul BESTINVEST CAMIMOB</p>
                <p style="margin: 5px 0 0 0;">www.camimob.ro</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error('Error sending service request email:', error);
      return { success: false, error };
    }

    console.log('Service request email sent successfully:', emailData);
    return { success: true, data: emailData };
  } catch (error) {
    console.error('Failed to send service request email:', error);
    return { success: false, error };
  }
}
