use anchor_lang::prelude::*;
use anchor_lang::system_program::{self, Transfer as SolTransfer};

declare_id!("2yNo3xJD5Qj1HYiAZZ4tKYgRp5HwLt2VXHjzckETMpYG");

pub const FEE_LAMPORTS: u64 = 5_000_000; // 0.005 SOL
pub const MAX_INACTIVITY_PERIOD: i64 = 10 * 365 * 24 * 60 * 60; // 10 años

// ============================================================
// FEE WALLET — CAMBIA ESTA DIRECCIÓN POR LA TUYA
pub const FEE_WALLET: Pubkey = Pubkey::new_from_array([219, 182, 236, 230, 5, 128, 83, 192, 32, 157, 253, 126, 198, 149, 245, 57, 228, 130, 208, 91, 249, 246, 234, 84, 44, 229, 176, 41, 22, 151, 23, 193]);
// ============================================================


#[program]
pub mod sucesion_segura {
    use super::*;

    pub fn initialize_vault(
        ctx: Context<InitializeVault>,
        inactivity_period: i64,
        beneficiary_emails: [String; 2],
        guarantee_lamports: u64,
    ) -> Result<()> {
        require!(guarantee_lamports > 0, SucesionError::InvalidGuarantee);
        require!(
            inactivity_period > 0 && inactivity_period <= MAX_INACTIVITY_PERIOD,
            SucesionError::InvalidInactivityPeriod
        );
        require!(
            ctx.accounts.beneficiary1.key() != ctx.accounts.beneficiary2.key(),
            SucesionError::DuplicateBeneficiary
        );
        require!(
            ctx.accounts.beneficiary1.key() != ctx.accounts.owner.key()
                && ctx.accounts.beneficiary2.key() != ctx.accounts.owner.key(),
            SucesionError::OwnerCannotBeBeneficiary
        );

        let vault = &mut ctx.accounts.vault;
        vault.owner = ctx.accounts.owner.key();
        vault.beneficiary_emails = beneficiary_emails.to_vec();
        vault.beneficiary_pubkeys = [
            ctx.accounts.beneficiary1.key(),
            ctx.accounts.beneficiary2.key(),
        ]
        .to_vec();
        vault.inactivity_period = inactivity_period;
        vault.last_active = Clock::get()?.unix_timestamp;
        vault.is_triggered = false;
        vault.guarantee_lamports = guarantee_lamports;
        vault.sol_vault_bump = ctx.bumps.sol_vault;
        vault.triggered_at = 0;
        vault.withdrawal_claimed = false;
        vault.paused = false;
        vault.paused_at = 0;
        vault.max_pause_duration = 0;

        let fee_accounts = SolTransfer {
            from: ctx.accounts.owner.to_account_info(),
            to: ctx.accounts.fee_wallet.to_account_info(),
        };
        let fee_ctx = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            fee_accounts,
        );
        system_program::transfer(fee_ctx, FEE_LAMPORTS)?;

        let guarantee_accounts = SolTransfer {
            from: ctx.accounts.owner.to_account_info(),
            to: ctx.accounts.sol_vault.to_account_info(),
        };
        let guarantee_ctx = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            guarantee_accounts,
        );
        system_program::transfer(guarantee_ctx, guarantee_lamports)?;

        msg!("Bóveda creada. Comisión y garantía bloqueadas.");
        Ok(())
    }

    pub fn ping(ctx: Context<Ping>) -> Result<()> {
        let vault = &mut ctx.accounts.vault;
        require!(!vault.is_triggered, SucesionError::AlreadyTriggered);
        vault.last_active = Clock::get()?.unix_timestamp;
        msg!("Ping registrado.");
        Ok(())
    }

    pub fn cancel_vault(ctx: Context<CancelVault>) -> Result<()> {
        let vault = &ctx.accounts.vault;
        require!(!vault.is_triggered, SucesionError::AlreadyTriggered);

        let clock = Clock::get()?;
        require!(
            clock.unix_timestamp <= vault.last_active + vault.inactivity_period,
            SucesionError::NotYetExpired
        );

        if vault.guarantee_lamports > 0 {
            let owner_key = vault.owner;
            let bump = vault.sol_vault_bump;
            let seeds = &[b"sol_vault", owner_key.as_ref(), &[bump]];
            let signer = &[&seeds[..]];

            let cpi_accounts = SolTransfer {
                from: ctx.accounts.sol_vault.to_account_info(),
                to: ctx.accounts.owner.to_account_info(),
            };
            let cpi_ctx = CpiContext::new_with_signer(
                ctx.accounts.system_program.to_account_info(),
                cpi_accounts,
                signer,
            );
            system_program::transfer(cpi_ctx, vault.guarantee_lamports)?;
        }

        msg!("Bóveda cancelada. Garantía devuelta.");
        Ok(())
    }

    pub fn pause_inheritance(ctx: Context<PauseInheritance>, max_days: i64) -> Result<()> {
        let vault = &mut ctx.accounts.vault;
        let clock = Clock::get()?;
        require!(!vault.is_triggered, SucesionError::AlreadyTriggered);
        require!(!vault.paused, SucesionError::AlreadyPaused);
        require!(max_days > 0 && max_days <= 90, SucesionError::InvalidPauseDuration);

        vault.paused = true;
        vault.paused_at = clock.unix_timestamp;
        vault.max_pause_duration = max_days * 24 * 60 * 60;
        msg!("Pausada por {} días", max_days);
        Ok(())
    }

    pub fn resume_inheritance(ctx: Context<ResumeInheritance>) -> Result<()> {
        let vault = &mut ctx.accounts.vault;
        let clock = Clock::get()?;
        require!(!vault.is_triggered, SucesionError::AlreadyTriggered);
        require!(vault.paused, SucesionError::NotPaused);

        vault.paused = false;
        vault.paused_at = 0;
        vault.max_pause_duration = 0;
        vault.last_active = clock.unix_timestamp;
        msg!("Bóveda reanudada.");
        Ok(())
    }

    pub fn trigger_inheritance(ctx: Context<TriggerInheritance>) -> Result<()> {
        let vault = &mut ctx.accounts.vault;
        let clock = Clock::get()?;
        require!(!vault.is_triggered, SucesionError::AlreadyTriggered);

        let caller_key = ctx.accounts.caller.key();
        let is_owner = caller_key == vault.owner;
        let is_beneficiary = vault.beneficiary_pubkeys.contains(&caller_key);
        require!(is_owner || is_beneficiary, SucesionError::Unauthorized);

        if vault.paused {
            require!(
                clock.unix_timestamp >= vault.paused_at + vault.max_pause_duration,
                SucesionError::StillPaused
            );
        } else {
            require!(
                clock.unix_timestamp >= vault.last_active + vault.inactivity_period,
                SucesionError::NotYetExpired
            );
        }

        vault.is_triggered = true;
        vault.triggered_at = clock.unix_timestamp;
        msg!("Herencia activada.");
        Ok(())
    }

    pub fn claim_inheritance(ctx: Context<ClaimInheritance>) -> Result<()> {
        let vault = &mut ctx.accounts.vault;
        require!(vault.is_triggered, SucesionError::NotYetExpired);
        require!(!vault.withdrawal_claimed, SucesionError::AlreadyClaimed);

        let b1 = vault.beneficiary_pubkeys[0];
        let b2 = vault.beneficiary_pubkeys[1];

        require!(
            ctx.accounts.beneficiary1.key() != ctx.accounts.beneficiary2.key(),
            SucesionError::DuplicateBeneficiary
        );
        require!(
            ctx.accounts.beneficiary1.key() == b1 && ctx.accounts.beneficiary1.is_signer,
            SucesionError::Unauthorized
        );
        require!(
            ctx.accounts.beneficiary2.key() == b2 && ctx.accounts.beneficiary2.is_signer,
            SucesionError::Unauthorized
        );

        vault.withdrawal_claimed = true;

        if vault.guarantee_lamports > 0 {
            let owner_key = ctx.accounts.owner.key();
            let bump = vault.sol_vault_bump;
            let seeds = &[b"sol_vault", owner_key.as_ref(), &[bump]];
            let signer = &[&seeds[..]];

            let half = vault.guarantee_lamports / 2;
            let rem = vault.guarantee_lamports - half;

            let cpi_accounts1 = SolTransfer {
                from: ctx.accounts.sol_vault.to_account_info(),
                to: ctx.accounts.beneficiary1.to_account_info(),
            };
            let cpi_ctx1 = CpiContext::new_with_signer(
                ctx.accounts.system_program.to_account_info(),
                cpi_accounts1,
                signer,
            );
            system_program::transfer(cpi_ctx1, half)?;

            let cpi_accounts2 = SolTransfer {
                from: ctx.accounts.sol_vault.to_account_info(),
                to: ctx.accounts.beneficiary2.to_account_info(),
            };
            let cpi_ctx2 = CpiContext::new_with_signer(
                ctx.accounts.system_program.to_account_info(),
                cpi_accounts2,
                signer,
            );
            system_program::transfer(cpi_ctx2, rem)?;
        }

        msg!("Herencia reclamada.");
        Ok(())
    }
}

// ============================================================
// CONTEXTS
// ============================================================

#[derive(Accounts)]
#[instruction(inactivity_period: i64, beneficiary_emails: [String; 2], guarantee_lamports: u64)]
pub struct InitializeVault<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(
        init,
        payer = owner,
        space = 8 + Vault::INIT_SPACE,
        seeds = [b"vault", owner.key().as_ref()],
        bump,
    )]
    pub vault: Account<'info, Vault>,

    /// CHECK: PDA que custodia la garantía en SOL
    #[account(
        mut,
        seeds = [b"sol_vault", owner.key().as_ref()],
        bump,
    )]
    pub sol_vault: UncheckedAccount<'info>,

    /// CHECK: Wallet donde se cobra la comisión — dirección fija
    #[account(
        mut,
        address = FEE_WALLET @ SucesionError::InvalidFeeWallet,
    )]
    pub fee_wallet: UncheckedAccount<'info>,

    /// CHECK: heredero 1
    pub beneficiary1: UncheckedAccount<'info>,
    /// CHECK: heredero 2
    pub beneficiary2: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct Ping<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    #[account(mut, seeds = [b"vault", owner.key().as_ref()], bump, has_one = owner)]
    pub vault: Account<'info, Vault>,
}

#[derive(Accounts)]
pub struct CancelVault<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(
        mut,
        close = owner,
        seeds = [b"vault", owner.key().as_ref()],
        bump,
        has_one = owner,
    )]
    pub vault: Account<'info, Vault>,

    /// CHECK: PDA que custodia la garantía en SOL
    #[account(
        mut,
        seeds = [b"sol_vault", owner.key().as_ref()],
        bump = vault.sol_vault_bump,
    )]
    pub sol_vault: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct PauseInheritance<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    #[account(mut, seeds = [b"vault", owner.key().as_ref()], bump, has_one = owner)]
    pub vault: Account<'info, Vault>,
}

#[derive(Accounts)]
pub struct ResumeInheritance<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    #[account(mut, seeds = [b"vault", owner.key().as_ref()], bump, has_one = owner)]
    pub vault: Account<'info, Vault>,
}

#[derive(Accounts)]
pub struct TriggerInheritance<'info> {
    #[account(mut)]
    pub caller: Signer<'info>,

    /// CHECK: Owner de la bóveda, solo se usa para derivar la PDA
    pub owner: UncheckedAccount<'info>,

    #[account(
        mut,
        seeds = [b"vault", owner.key().as_ref()],
        bump,
        has_one = owner,
    )]
    pub vault: Account<'info, Vault>,
}

#[derive(Accounts)]
pub struct ClaimInheritance<'info> {
    #[account(mut)]
    pub beneficiary1: Signer<'info>,
    #[account(mut)]
    pub beneficiary2: Signer<'info>,

    /// CHECK: Owner de la bóveda, solo se usa para derivar la PDA
    pub owner: UncheckedAccount<'info>,

    #[account(
        mut,
        seeds = [b"vault", owner.key().as_ref()],
        bump,
        has_one = owner,
    )]
    pub vault: Account<'info, Vault>,

    /// CHECK: PDA que custodia la garantía en SOL
    #[account(
        mut,
        seeds = [b"sol_vault", owner.key().as_ref()],
        bump = vault.sol_vault_bump,
    )]
    pub sol_vault: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
}

// ============================================================
// STATE
// ============================================================

#[account]
#[derive(InitSpace)]
pub struct Vault {
    pub owner: Pubkey,
    #[max_len(2, 100)]
    pub beneficiary_emails: Vec<String>,
    #[max_len(2)]
    pub beneficiary_pubkeys: Vec<Pubkey>,
    pub inactivity_period: i64,
    pub last_active: i64,
    pub is_triggered: bool,
    pub guarantee_lamports: u64,
    pub sol_vault_bump: u8,
    pub triggered_at: i64,
    pub withdrawal_claimed: bool,
    pub paused: bool,
    pub paused_at: i64,
    pub max_pause_duration: i64,
}

// ============================================================
// ERRORS
// ============================================================

#[error_code]
pub enum SucesionError {
    #[msg("No autorizado.")]
    Unauthorized,
    #[msg("La bóveda ya ha sido activada.")]
    AlreadyTriggered,
    #[msg("El período de inactividad aún no ha expirado.")]
    NotYetExpired,
    #[msg("Los activos ya han sido reclamados.")]
    AlreadyClaimed,
    #[msg("La bóveda ya está pausada.")]
    AlreadyPaused,
    #[msg("La bóveda no está pausada.")]
    NotPaused,
    #[msg("La bóveda sigue en pausa.")]
    StillPaused,
    #[msg("La pausa debe ser entre 1 y 90 días.")]
    InvalidPauseDuration,
    #[msg("Fee wallet inválida.")]
    InvalidFeeWallet,
    #[msg("La garantía debe ser mayor a 0.")]
    InvalidGuarantee,
    #[msg("El período de inactividad debe estar entre 1 segundo y 10 años.")]
    InvalidInactivityPeriod,
    #[msg("Los dos herederos deben ser diferentes.")]
    DuplicateBeneficiary,
    #[msg("El owner no puede ser heredero de sí mismo.")]
    OwnerCannotBeBeneficiary,
}
